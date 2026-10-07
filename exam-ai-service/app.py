from flask import Flask, request, jsonify

from flask_cors import CORS

from cheating_detection import CheatingDetector

from code_evaluator import CodeEvaluator

import base64

import json

import os

import random

import tempfile

app = Flask(__name__)

CORS(app)

cheating_detector = CheatingDetector()

code_evaluator = CodeEvaluator()

# ============================================================

# AI QUESTION GENERATOR

# ============================================================

# This is a local smart question generator. It does not require

# an external API key or internet connection. It creates MCQs

# from curated technical-question templates based on topic and

# difficulty.

#

# Later, if you want a real LLM-backed generator, this endpoint

# can be replaced without changing the React UI contract.

# ============================================================

QUESTION_BANK = {'Java': {'easy': [{'questionText': 'Which keyword is used to inherit a class in Java?',

                    'optionA': 'implements',

                    'optionB': 'extends',

                    'optionC': 'inherits',

                    'optionD': 'super',

                    'correctAnswer': 'B',

                    'explanation': 'The extends keyword establishes class inheritance.'},

                   {'questionText': 'Which collection does not allow duplicate elements?',

                    'optionA': 'List',

                    'optionB': 'ArrayList',

                    'optionC': 'Set',

                    'optionD': 'Vector',

                    'correctAnswer': 'C',

                    'explanation': 'Set implementations store unique elements.'},

                   {'questionText': 'Which method is the entry point of a standard Java application?',

                    'optionA': 'start()',

                    'optionB': 'run()',

                    'optionC': 'main()',

                    'optionD': 'execute()',

                    'correctAnswer': 'C',

                    'explanation': 'The JVM starts a conventional application through main().'},

                   {'questionText': 'Which keyword creates an object in Java?',

                    'optionA': 'class',

                    'optionB': 'new',

                    'optionC': 'object',

                    'optionD': 'create',

                    'correctAnswer': 'B',

                    'explanation': 'new allocates an object and invokes its constructor.'},

                   {'questionText': 'Which primitive type stores a single character?',

                    'optionA': 'String',

                    'optionB': 'char',

                    'optionC': 'character',

                    'optionD': 'bytechar',

                    'correctAnswer': 'B',

                    'explanation': 'char represents a single UTF-16 code unit.'}],

          'medium': [{'questionText': 'Which interface defines natural ordering for Java objects?',

                      'optionA': 'Comparator',

                      'optionB': 'Comparable',

                      'optionC': 'Iterable',

                      'optionD': 'Collection',

                      'correctAnswer': 'B',

                      'explanation': 'Comparable defines compareTo() for natural ordering.'},

                     {'questionText': 'What is the average time complexity of HashMap get() with good hashing?',

                      'optionA': 'O(n)',

                      'optionB': 'O(log n)',

                      'optionC': 'O(1)',

                      'optionD': 'O(n log n)',

                      'correctAnswer': 'C',

                      'explanation': 'HashMap lookup is expected O(1) on average.'},

                     {'questionText': 'Which keyword prevents a Java method from being overridden?',

                      'optionA': 'static',

                      'optionB': 'final',

                      'optionC': 'private',

                      'optionD': 'abstract',

                      'correctAnswer': 'B',

                      'explanation': 'A final method cannot be overridden.'},

                     {'questionText': 'Which collection provides constant-time indexed access on average?',

                      'optionA': 'LinkedList',

                      'optionB': 'ArrayList',

                      'optionC': 'TreeSet',

                      'optionD': 'PriorityQueue',

                      'correctAnswer': 'B',

                      'explanation': 'ArrayList uses an array-backed structure for indexed access.'},

                     {'questionText': 'What happens if a checked exception is neither caught nor declared?',

                      'optionA': 'Compiler error',

                      'optionB': 'JVM ignores it',

                      'optionC': 'It becomes unchecked',

                      'optionD': 'It always compiles',

                      'correctAnswer': 'A',

                      'explanation': 'Checked exceptions must be caught or declared.'}],

          'hard': [{'questionText': 'How are Java generics implemented primarily at runtime?',

                    'optionA': 'Templates',

                    'optionB': 'Type erasure',

                    'optionC': 'Reflection only',

                    'optionD': 'Macros',

                    'correctAnswer': 'B',

                    'explanation': 'Java generics are implemented primarily through type erasure.'},

                   {'questionText': 'Which mechanism reclaims memory from unreachable Java objects?',

                    'optionA': 'Serialization',

                    'optionB': 'Garbage collection',

                    'optionC': 'Reflection',

                    'optionD': 'Class loading',

                    'correctAnswer': 'B',

                    'explanation': 'The JVM garbage collector reclaims unreachable objects.'},

                   {'questionText': 'Which Java keyword can explicitly invoke a superclass constructor?',

                    'optionA': 'this',

                    'optionB': 'super',

                    'optionC': 'base',

                    'optionD': 'parent',

                    'correctAnswer': 'B',

                    'explanation': 'super() invokes the superclass constructor.'},

                   {'questionText': 'Which statement about interfaces in modern Java is correct?',

                    'optionA': 'They cannot have any implemented methods',

                    'optionB': 'They may contain default and static methods',

                    'optionC': 'They must be instantiated directly',

                    'optionD': 'They cannot declare constants',

                    'correctAnswer': 'B',

                    'explanation': 'Interfaces can declare default and static methods.'},

                   {'questionText': 'What does volatile primarily provide for a shared Java variable?',

                    'optionA': 'Atomicity of all operations',

                    'optionB': 'Visibility guarantees across threads',

                    'optionC': 'Automatic locking',

                    'optionD': 'Immutability',

                    'correctAnswer': 'B',

                    'explanation': 'volatile establishes visibility/order guarantees, not general atomicity.'}]},

 'Spring Boot': {'easy': [{'questionText': 'Which annotation is commonly used for a REST controller?',

                           'optionA': '@Service',

                           'optionB': '@Repository',

                           'optionC': '@RestController',

                           'optionD': '@Entity',

                           'correctAnswer': 'C',

                           'explanation': '@RestController combines controller semantics with response-body handling.'},

                          {'questionText': 'Which annotation can be used for dependency injection?',

                           'optionA': '@Autowired',

                           'optionB': '@InjectBean',

                           'optionC': '@Dependency',

                           'optionD': '@WireOnly',

                           'correctAnswer': 'A',

                           'explanation': '@Autowired asks Spring to inject a matching dependency.'},

                          {'questionText': 'Which annotation marks a class as a Spring service component?',

                           'optionA': '@Service',

                           'optionB': '@Table',

                           'optionC': '@BeanOnly',

                           'optionD': '@Web',

                           'correctAnswer': 'A',

                           'explanation': '@Service is a stereotype for service-layer components.'},

                          {'questionText': 'Which file commonly stores Spring Boot application configuration?',

                           'optionA': 'index.html',

                           'optionB': 'application.properties',

                           'optionC': 'pom.html',

                           'optionD': 'server.java',

                           'correctAnswer': 'B',

                           'explanation': 'application.properties is a standard Spring Boot configuration file.'},

                          {'questionText': 'Which annotation maps a method to a GET request?',

                           'optionA': '@PostMapping',

                           'optionB': '@GetMapping',

                           'optionC': '@PutMapping',

                           'optionD': '@DeleteOnly',

                           'correctAnswer': 'B',

                           'explanation': '@GetMapping maps HTTP GET requests.'}],

                 'medium': [{'questionText': 'Which Spring Boot feature configures beans based on dependencies on the '

                                             'classpath?',

                             'optionA': 'Auto-configuration',

                             'optionB': 'Manual wiring only',

                             'optionC': 'Static compilation',

                             'optionD': 'Servlet inheritance',

                             'correctAnswer': 'A',

                             'explanation': 'Spring Boot auto-configuration creates suitable beans based on '

                                            'conditions.'},

                            {'questionText': 'Which annotation binds a Java class to configuration properties?',

                             'optionA': '@ConfigurationProperties',

                             'optionB': '@RequestBody',

                             'optionC': '@PathVariable',

                             'optionD': '@ResponseOnly',

                             'correctAnswer': 'A',

                             'explanation': '@ConfigurationProperties maps external configuration into a bean.'},

                            {'questionText': 'Which annotation declares a transactional boundary?',

                             'optionA': '@Transactional',

                             'optionB': '@TransactOnly',

                             'optionC': '@Database',

                             'optionD': '@CommitNow',

                             'correctAnswer': 'A',

                             'explanation': '@Transactional defines transaction semantics around a method or class.'},

                            {'questionText': 'Which layer commonly handles HTTP requests in a Spring Boot REST '

                                             'application?',

                             'optionA': 'Controller',

                             'optionB': 'Repository only',

                             'optionC': 'Entity only',

                             'optionD': 'Database driver',

                             'correctAnswer': 'A',

                             'explanation': 'Controllers receive and route HTTP requests.'},

                            {'questionText': 'What does Spring Boot Actuator mainly provide?',

                             'optionA': 'Game rendering',

                             'optionB': 'Application monitoring and management endpoints',

                             'optionC': 'SQL syntax checking',

                             'optionD': 'Java compilation',

                             'correctAnswer': 'B',

                             'explanation': 'Actuator exposes operational endpoints such as health and metrics.'}],

                 'hard': [{'questionText': 'What is the default scope of a Spring bean?',

                           'optionA': 'Prototype',

                           'optionB': 'Singleton',

                           'optionC': 'Request',

                           'optionD': 'Session',

                           'correctAnswer': 'B',

                           'explanation': 'Spring beans are singleton-scoped by default.'},

                          {'questionText': 'Which mechanism is commonly used to resolve circular dependency problems '

                                           'in Spring design?',

                           'optionA': 'Use constructor injection blindly',

                           'optionB': 'Redesign dependencies or introduce a suitable abstraction',

                           'optionC': 'Disable the JVM',

                           'optionD': 'Remove all interfaces',

                           'correctAnswer': 'B',

                           'explanation': 'Refactoring dependencies is generally preferred for circular references.'},

                          {'questionText': 'Which annotation can enable asynchronous method execution?',

                           'optionA': '@Async',

                           'optionB': '@ParallelOnly',

                           'optionC': '@Thread',

                           'optionD': '@BackgroundOnly',

                           'correctAnswer': 'A',

                           'explanation': '@Async can execute supported methods asynchronously when async processing '

                                          'is enabled.'},

                          {'questionText': 'Which Spring abstraction is commonly used to access relational data '

                                           'through repositories?',

                           'optionA': 'Spring Data JPA',

                           'optionB': 'Spring Paint',

                           'optionC': 'Spring UI',

                           'optionD': 'Spring Shell only',

                           'correctAnswer': 'A',

                           'explanation': 'Spring Data JPA provides repository abstractions over JPA.'},

                          {'questionText': 'What does @RequestBody typically do in a REST controller?',

                           'optionA': 'Reads HTTP request body into a Java object',

                           'optionB': 'Starts a database',

                           'optionC': 'Creates a thread',

                           'optionD': 'Changes server port',

                           'correctAnswer': 'A',

                           'explanation': 'It deserializes the request body into a Java object.'}]},

 'SQL': {'easy': [{'questionText': 'Which SQL command retrieves data?',

                   'optionA': 'GET',

                   'optionB': 'SELECT',

                   'optionC': 'FETCHROW',

                   'optionD': 'READ',

                   'correctAnswer': 'B',

                   'explanation': 'SELECT retrieves rows and columns.'},

                  {'questionText': 'Which clause filters rows before grouping?',

                   'optionA': 'ORDER BY',

                   'optionB': 'GROUP BY',

                   'optionC': 'WHERE',

                   'optionD': 'SORT',

                   'correctAnswer': 'C',

                   'explanation': 'WHERE filters rows.'},

                  {'questionText': 'Which command adds a new row?',

                   'optionA': 'INSERT',

                   'optionB': 'ADDROW',

                   'optionC': 'CREATE ROW',

                   'optionD': 'APPEND ONLY',

                   'correctAnswer': 'A',

                   'explanation': 'INSERT adds rows to a table.'},

                  {'questionText': 'Which command changes existing rows?',

                   'optionA': 'CHANGE',

                   'optionB': 'UPDATE',

                   'optionC': 'ALTER ROW',

                   'optionD': 'MODIFY TABLE ROW',

                   'correctAnswer': 'B',

                   'explanation': 'UPDATE changes existing row values.'},

                  {'questionText': 'Which clause sorts query results?',

                   'optionA': 'ORDER BY',

                   'optionB': 'SORT BY ONLY',

                   'optionC': 'ARRANGE',

                   'optionD': 'SEQUENCE',

                   'correctAnswer': 'A',

                   'explanation': 'ORDER BY sorts the result set.'}],

         'medium': [{'questionText': 'Which clause filters grouped results after aggregation?',

                     'optionA': 'WHERE',

                     'optionB': 'HAVING',

                     'optionC': 'FILTER ROW',

                     'optionD': 'GROUP FILTER',

                     'correctAnswer': 'B',

                     'explanation': 'HAVING filters groups produced by GROUP BY.'},

                    {'questionText': 'Which JOIN returns rows with matching values in both tables?',

                     'optionA': 'INNER JOIN',

                     'optionB': 'CROSS JOIN',

                     'optionC': 'FULL CARTESIAN JOIN',

                     'optionD': 'UNION JOIN',

                     'correctAnswer': 'A',

                     'explanation': 'INNER JOIN returns rows satisfying the join condition.'},

                    {'questionText': 'Which aggregate function counts rows?',

                     'optionA': 'SUM()',

                     'optionB': 'COUNT()',

                     'optionC': 'TOTALROWS()',

                     'optionD': 'ROWS()',

                     'correctAnswer': 'B',

                     'explanation': 'COUNT() counts rows or non-null expressions depending on its argument.'},

                    {'questionText': 'Which keyword removes duplicate rows from a SELECT result?',

                     'optionA': 'UNIQUE',

                     'optionB': 'DISTINCT',

                     'optionC': 'ONLY',

                     'optionD': 'DEDUP',

                     'correctAnswer': 'B',

                     'explanation': 'DISTINCT removes duplicate result rows.'},

                    {'questionText': 'Which constraint uniquely identifies each row in a table?',

                     'optionA': 'FOREIGN KEY',

                     'optionB': 'PRIMARY KEY',

                     'optionC': 'CHECK',

                     'optionD': 'DEFAULT',

                     'correctAnswer': 'B',

                     'explanation': 'A primary key uniquely identifies table rows.'}],

         'hard': [{'questionText': 'Which function ranks rows within partitions without collapsing them?',

                   'optionA': 'ROW_NUMBER()',

                   'optionB': 'DELETE',

                   'optionC': 'DISTINCT only',

                   'optionD': 'TRUNCATE',

                   'correctAnswer': 'A',

                   'explanation': 'ROW_NUMBER() is a window function that assigns sequence numbers.'},

                  {'questionText': 'Which index structure is commonly used by relational databases for ordered '

                                   'lookups?',

                   'optionA': 'B-tree',

                   'optionB': 'Stack',

                   'optionC': 'Queue',

                   'optionD': 'Linked graph only',

                   'correctAnswer': 'A',

                   'explanation': 'B-tree family indexes are widely used for ordered lookups.'},

                  {'questionText': 'What is a correlated subquery?',

                   'optionA': 'A subquery independent of outer query',

                   'optionB': 'A subquery that references the outer query',

                   'optionC': 'A query without SELECT',

                   'optionD': 'A table constraint',

                   'correctAnswer': 'B',

                   'explanation': 'A correlated subquery refers to values from the outer query.'},

                  {'questionText': 'Which normal form primarily removes partial dependency on part of a composite key?',

                   'optionA': '1NF',

                   'optionB': '2NF',

                   'optionC': '3NF',

                   'optionD': 'BCNF only',

                   'correctAnswer': 'B',

                   'explanation': 'Second normal form removes partial dependencies.'},

                  {'questionText': 'Which clause can define a window partition for a window function?',

                   'optionA': 'PARTITION BY',

                   'optionB': 'WINDOW GROUP',

                   'optionC': 'GROUP PARTITION',

                   'optionD': 'SPLIT BY',

                   'correctAnswer': 'A',

                   'explanation': 'PARTITION BY divides rows into groups for window calculations.'}]},

 'JavaScript': {'easy': [{'questionText': 'Which keyword declares a reassignable block-scoped variable?',

                          'optionA': 'var',

                          'optionB': 'let',

                          'optionC': 'const',

                          'optionD': 'static',

                          'correctAnswer': 'B',

                          'explanation': 'let is block-scoped and can be reassigned.'},

                         {'questionText': 'Which method converts an object to a JSON string?',

                          'optionA': 'JSON.parse()',

                          'optionB': 'JSON.stringify()',

                          'optionC': 'JSON.convert()',

                          'optionD': 'JSON.encodeObject()',

                          'correctAnswer': 'B',

                          'explanation': 'JSON.stringify() serializes a value to JSON text.'},

                         {'questionText': 'Which symbol is used for strict equality?',

                          'optionA': '==',

                          'optionB': '===',

                          'optionC': '=',

                          'optionD': '!== only',

                          'correctAnswer': 'C',

                          'explanation': '=== checks value and type without coercion.'},

                         {'questionText': 'Which method adds an item to the end of an array?',

                          'optionA': 'push()',

                          'optionB': 'pop()',

                          'optionC': 'shift()',

                          'optionD': 'unshift()',

                          'correctAnswer': 'A',

                          'explanation': 'push() appends elements to the end.'},

                         {'questionText': 'Which value represents an explicitly absent value?',

                          'optionA': 'undefined',

                          'optionB': 'NaN only',

                          'optionC': 'Infinity',

                          'optionD': 'void object',

                          'correctAnswer': 'A',

                          'explanation': 'undefined commonly represents an unassigned or missing value.'}],

                'medium': [{'questionText': 'What does Array.prototype.map() return?',

                            'optionA': 'The original array only',

                            'optionB': 'A new transformed array',

                            'optionC': 'A number',

                            'optionD': 'A boolean',

                            'correctAnswer': 'B',

                            'explanation': 'map() creates a new array from callback results.'},

                           {'questionText': 'Which statement creates a Promise that is immediately fulfilled?',

                            'optionA': 'new Promise(resolve => resolve())',

                            'optionB': 'new Promise(reject => reject())',

                            'optionC': 'Promise.none()',

                            'optionD': 'Promise.done()',

                            'correctAnswer': 'A',

                            'explanation': 'Calling resolve fulfills the Promise.'},

                           {'questionText': 'What is event delegation based on?',

                            'optionA': 'Listening on a common ancestor',

                            'optionB': 'Creating one listener per process',

                            'optionC': 'Disabling bubbling',

                            'optionD': 'Using only timers',

                            'correctAnswer': 'A',

                            'explanation': 'Event delegation uses bubbling and a shared ancestor handler.'},

                           {'questionText': 'Which operator provides a fallback only when the left side is null or '

                                            'undefined?',

                            'optionA': '||',

                            'optionB': '??',

                            'optionC': '&&',

                            'optionD': '=>',

                            'correctAnswer': 'B',

                            'explanation': 'The nullish coalescing operator ?? checks for null or undefined.'},

                           {'questionText': 'What does destructuring allow?',

                            'optionA': 'Extracting values from arrays or objects',

                            'optionB': 'Compiling JavaScript',

                            'optionC': 'Creating CSS',

                            'optionD': 'Opening sockets automatically',

                            'correctAnswer': 'A',

                            'explanation': 'Destructuring extracts values into variables.'}],

                'hard': [{'questionText': 'Which concept lets a function retain access to lexical variables after the '

                                          'outer function returns?',

                          'optionA': 'Hoisting',

                          'optionB': 'Closure',

                          'optionC': 'Destructuring',

                          'optionD': 'Casting',

                          'correctAnswer': 'B',

                          'explanation': 'A closure retains access to its lexical environment.'},

                         {'questionText': 'What is the JavaScript event loop primarily responsible for?',

                          'optionA': 'Coordinating asynchronous callbacks and the call stack',

                          'optionB': 'Compiling CSS',

                          'optionC': 'Managing SQL tables',

                          'optionD': 'Allocating all memory manually',

                          'correctAnswer': 'A',

                          'explanation': 'The event loop coordinates queued tasks with the call stack.'},

                         {'questionText': 'Which feature prevents mutation of an object only at the top level?',

                          'optionA': 'Object.freeze()',

                          'optionB': 'Object.lockDeep()',

                          'optionC': 'const object',

                          'optionD': 'sealAll()',

                          'correctAnswer': 'A',

                          'explanation': 'Object.freeze() freezes the immediate object properties.'},

                         {'questionText': 'What does async function always return?',

                          'optionA': 'A Promise',

                          'optionB': 'A string',

                          'optionC': 'A generator',

                          'optionD': 'A thread',

                          'correctAnswer': 'A',

                          'explanation': 'An async function returns a Promise.'},

                         {'questionText': 'Which collection stores unique values and preserves insertion order for '

                                          'iteration?',

                          'optionA': 'Set',

                          'optionB': 'WeakMap',

                          'optionC': 'ArrayBuffer',

                          'optionD': 'DataView',

                          'correctAnswer': 'A',

                          'explanation': 'Set stores unique values and iteration follows insertion order.'}]},

 'Python': {'easy': [{'questionText': 'Which keyword defines a function in Python?',

                      'optionA': 'function',

                      'optionB': 'def',

                      'optionC': 'fun',

                      'optionD': 'method',

                      'correctAnswer': 'B',

                      'explanation': 'Python uses def to define functions.'},

                     {'questionText': 'Which data type is ordered and mutable?',

                      'optionA': 'tuple',

                      'optionB': 'list',

                      'optionC': 'frozenset',

                      'optionD': 'string',

                      'correctAnswer': 'B',

                      'explanation': 'Lists are ordered mutable collections.'},

                     {'questionText': 'Which symbol starts a comment?',

                      'optionA': '//',

                      'optionB': '#',

                      'optionC': '<!--',

                      'optionD': '/*',

                      'correctAnswer': 'B',

                      'explanation': 'Python uses # for single-line comments.'},

                     {'questionText': 'Which function returns the length of a sequence?',

                      'optionA': 'size()',

                      'optionB': 'length()',

                      'optionC': 'len()',

                      'optionD': 'countall()',

                      'correctAnswer': 'C',

                      'explanation': 'len() returns the number of items.'},

                     {'questionText': 'Which keyword imports a module?',

                      'optionA': 'include',

                      'optionB': 'import',

                      'optionC': 'using',

                      'optionD': 'requirepy',

                      'correctAnswer': 'B',

                      'explanation': 'import loads a module or names from a module.'}],

            'medium': [{'questionText': 'Which construct handles exceptions?',

                        'optionA': 'try/except',

                        'optionB': 'check/catch',

                        'optionC': 'handle/error',

                        'optionD': 'safe/raiseonly',

                        'correctAnswer': 'A',

                        'explanation': 'Python uses try and except blocks for exception handling.'},

                       {'questionText': 'What is a list comprehension used for?',

                        'optionA': 'Creating lists concisely from an iterable',

                        'optionB': 'Defining classes only',

                        'optionC': 'Compiling modules',

                        'optionD': 'Creating threads only',

                        'correctAnswer': 'A',

                        'explanation': 'List comprehensions build lists using an expression and iterable.'},

                       {'questionText': 'What does enumerate() commonly provide?',

                        'optionA': 'Only values',

                        'optionB': 'Index-value pairs',

                        'optionC': 'Only indexes',

                        'optionD': 'Sorted values',

                        'correctAnswer': 'B',

                        'explanation': 'enumerate() yields index and value pairs.'},

                       {'questionText': 'Which data structure maps keys to values?',

                        'optionA': 'set',

                        'optionB': 'dict',

                        'optionC': 'tuple',

                        'optionD': 'bytes',

                        'correctAnswer': 'B',

                        'explanation': 'dict stores key-value mappings.'},

                       {'questionText': 'What does // do for integers?',

                        'optionA': 'Floating division',

                        'optionB': 'Floor division',

                        'optionC': 'String concatenation',

                        'optionD': 'Exponentiation',

                        'correctAnswer': 'B',

                        'explanation': '// performs floor division.'}],

            'hard': [{'questionText': 'What does a generator function use to produce values lazily?',

                      'optionA': 'return only',

                      'optionB': 'yield',

                      'optionC': 'lazy',

                      'optionD': 'defer',

                      'correctAnswer': 'B',

                      'explanation': 'yield turns a function into a generator.'},

                     {'questionText': 'Which decorator preserves a function call while adding wrapper behavior?',

                      'optionA': 'A custom decorator',

                      'optionB': 'A tuple',

                      'optionC': 'A list',

                      'optionD': 'A module import',

                      'correctAnswer': 'A',

                      'explanation': 'Decorators can wrap functions and modify behavior.'},

                     {'questionText': 'What does the GIL in CPython restrict?',

                      'optionA': 'Concurrent execution of Python bytecode by multiple threads',

                      'optionB': 'All network requests',

                      'optionC': 'All processes',

                      'optionD': 'Database connections',

                      'correctAnswer': 'A',

                      'explanation': 'The GIL limits simultaneous execution of Python bytecode in CPython threads.'},

                     {'questionText': 'Which statement about tuple immutability is correct?',

                      'optionA': 'Tuple elements cannot be reassigned through tuple indexing',

                      'optionB': 'Tuples are always deep immutable',

                      'optionC': 'Tuples cannot contain mutable objects',

                      'optionD': 'Tuples are unordered',

                      'correctAnswer': 'A',

                      'explanation': 'The tuple container is immutable, though it may contain mutable objects.'},

                     {'questionText': 'What is a context manager commonly used for?',

                      'optionA': 'Managing setup and cleanup around a block',

                      'optionB': 'Sorting arrays only',

                      'optionC': 'Defining SQL schemas',

                      'optionD': 'Starting Flask only',

                      'correctAnswer': 'A',

                      'explanation': 'Context managers manage resources around a with block.'}]},

 'HTML': {'easy': [{'questionText': 'Which HTML element creates a hyperlink?',

                    'optionA': '<link>',

                    'optionB': '<a>',

                    'optionC': '<href>',

                    'optionD': '<url>',

                    'correctAnswer': 'B',

                    'explanation': 'The anchor element creates hyperlinks.'},

                   {'questionText': 'Which tag defines the largest standard heading?',

                    'optionA': '<h6>',

                    'optionB': '<head>',

                    'optionC': '<h1>',

                    'optionD': '<title>',

                    'correctAnswer': 'C',

                    'explanation': 'h1 is the highest-level heading element.'},

                   {'questionText': 'Which element inserts an image?',

                    'optionA': '<image>',

                    'optionB': '<img>',

                    'optionC': '<picture-only>',

                    'optionD': '<src>',

                    'correctAnswer': 'B',

                    'explanation': 'img embeds an image resource.'},

                   {'questionText': 'Which tag creates an unordered list?',

                    'optionA': '<ol>',

                    'optionB': '<ul>',

                    'optionC': '<li>',

                    'optionD': '<list>',

                    'correctAnswer': 'B',

                    'explanation': 'ul represents an unordered list.'},

                   {'questionText': 'Which attribute specifies an image source?',

                    'optionA': 'href',

                    'optionB': 'src',

                    'optionC': 'link',

                    'optionD': 'path',

                    'correctAnswer': 'B',

                    'explanation': 'src specifies the resource URL.'}],

          'medium': [{'questionText': 'Which attribute provides alternative text for an image?',

                      'optionA': 'title',

                      'optionB': 'src',

                      'optionC': 'alt',

                      'optionD': 'caption',

                      'correctAnswer': 'C',

                      'explanation': 'alt provides alternative text.'},

                     {'questionText': 'Which semantic element represents navigation links?',

                      'optionA': '<nav>',

                      'optionB': '<navigate>',

                      'optionC': '<links>',

                      'optionD': '<menuonly>',

                      'correctAnswer': 'A',

                      'explanation': 'nav represents a navigation section.'},

                     {'questionText': 'Which element is used for a form control label?',

                      'optionA': '<label>',

                      'optionB': '<caption>',

                      'optionC': '<legend-only>',

                      'optionD': '<name>',

                      'correctAnswer': 'A',

                      'explanation': 'label associates descriptive text with a form control.'},

                     {'questionText': 'Which attribute connects a label to an input by id?',

                      'optionA': 'for',

                      'optionB': 'target',

                      'optionC': 'connect',

                      'optionD': 'bind',

                      'correctAnswer': 'A',

                      'explanation': 'The label for attribute matches the input id.'},

                     {'questionText': 'Which element is intended for self-contained content?',

                      'optionA': '<article>',

                      'optionB': '<span>',

                      'optionC': '<b>',

                      'optionD': '<i>',

                      'correctAnswer': 'A',

                      'explanation': 'article represents self-contained content.'}],

          'hard': [{'questionText': 'Which HTML feature is designed for responsive images with different sources?',

                    'optionA': 'srcset and sizes',

                    'optionB': 'fontset',

                    'optionC': 'responsive-img-only',

                    'optionD': 'media-css only',

                    'correctAnswer': 'A',

                    'explanation': 'srcset and sizes let browsers choose suitable image resources.'},

                   {'questionText': 'Which element is used to embed scalable vector graphics inline?',

                    'optionA': '<vector>',

                    'optionB': '<svg>',

                    'optionC': '<graphic>',

                    'optionD': '<canvas-svg>',

                    'correctAnswer': 'B',

                    'explanation': 'svg embeds scalable vector graphics.'},

                   {'questionText': 'Which attribute can prevent form submission when client-side validation fails?',

                    'optionA': 'required',

                    'optionB': 'stop',

                    'optionC': 'validate-only',

                    'optionD': 'preventSubmit',

                    'correctAnswer': 'A',

                    'explanation': 'required participates in built-in form validation.'},

                   {'questionText': 'Which element represents machine-readable date/time content?',

                    'optionA': '<time>',

                    'optionB': '<date>',

                    'optionC': '<datetime>',

                    'optionD': '<clock>',

                    'correctAnswer': 'A',

                    'explanation': 'time represents dates or times semantically.'},

                   {'questionText': 'Which relationship value indicates a stylesheet link?',

                    'optionA': 'rel="stylesheet"',

                    'optionB': 'type="css" only',

                    'optionC': 'href="style" only',

                    'optionD': 'css="true"',

                    'correctAnswer': 'A',

                    'explanation': 'rel="stylesheet" identifies the linked resource as a stylesheet.'}]},

 'CSS': {'easy': [{'questionText': 'Which CSS property changes text color?',

                   'optionA': 'font-color',

                   'optionB': 'text-color',

                   'optionC': 'color',

                   'optionD': 'foreground',

                   'correctAnswer': 'C',

                   'explanation': 'color sets the text/foreground color.'},

                  {'questionText': 'Which property sets an element background color?',

                   'optionA': 'bg-color',

                   'optionB': 'background-color',

                   'optionC': 'fill-color',

                   'optionD': 'back-color',

                   'correctAnswer': 'B',

                   'explanation': 'background-color sets the background color.'},

                  {'questionText': 'Which property controls the outside space of an element?',

                   'optionA': 'padding',

                   'optionB': 'margin',

                   'optionC': 'border',

                   'optionD': 'gap-only',

                   'correctAnswer': 'B',

                   'explanation': 'margin controls space outside the border.'},

                  {'questionText': 'Which property controls inside spacing?',

                   'optionA': 'margin',

                   'optionB': 'padding',

                   'optionC': 'spacing',

                   'optionD': 'inner-gap',

                   'correctAnswer': 'B',

                   'explanation': 'padding controls space between content and border.'},

                  {'questionText': 'Which selector targets an element by id?',

                   'optionA': '.#id',

                   'optionB': '#id',

                   'optionC': '.id',

                   'optionD': '*id',

                   'correctAnswer': 'B',

                   'explanation': 'The # selector targets an id.'}],

         'medium': [{'questionText': 'Which CSS layout system is primarily one-dimensional?',

                     'optionA': 'Flexbox',

                     'optionB': 'Grid',

                     'optionC': 'Float-only',

                     'optionD': 'Position-only',

                     'correctAnswer': 'A',

                     'explanation': 'Flexbox is designed primarily for one-dimensional layouts.'},

                    {'questionText': 'Which property controls stacking order for positioned elements?',

                     'optionA': 'stack',

                     'optionB': 'z-index',

                     'optionC': 'layer-index',

                     'optionD': 'order-z',

                     'correctAnswer': 'B',

                     'explanation': 'z-index controls stacking order in applicable contexts.'},

                    {'questionText': 'Which unit is relative to the root font size?',

                     'optionA': 'em',

                     'optionB': 'rem',

                     'optionC': 'px',

                     'optionD': 'vh',

                     'correctAnswer': 'B',

                     'explanation': 'rem is relative to the root element font size.'},

                    {'questionText': 'Which pseudo-class targets an element when the pointer is over it?',

                     'optionA': '::hover',

                     'optionB': ':hover',

                     'optionC': 'hover()',

                     'optionD': '@hover',

                     'correctAnswer': 'B',

                     'explanation': ':hover applies while an element is hovered.'},

                    {'questionText': 'Which property changes the main axis direction in Flexbox?',

                     'optionA': 'flex-direction',

                     'optionB': 'flex-axis',

                     'optionC': 'main-direction',

                     'optionD': 'direction-flex',

                     'correctAnswer': 'A',

                     'explanation': 'flex-direction controls the main axis direction.'}],

         'hard': [{'questionText': 'Which CSS feature lets custom property values be reused?',

                   'optionA': 'CSS variables',

                   'optionB': 'HTML macros',

                   'optionC': 'DOM constants',

                   'optionD': 'Style functions only',

                   'correctAnswer': 'A',

                   'explanation': 'Custom properties can be reused with var().'},

                  {'questionText': 'What does minmax() commonly define in CSS Grid?',

                   'optionA': 'A range for a track size',

                   'optionB': 'A color range',

                   'optionC': 'A font size',

                   'optionD': 'An animation duration',

                   'correctAnswer': 'A',

                   'explanation': 'minmax() defines minimum and maximum track sizes.'},

                  {'questionText': 'Which mechanism creates a new stacking context in several common cases?',

                   'optionA': 'transform',

                   'optionB': 'font-family',

                   'optionC': 'line-height only',

                   'optionD': 'text-align',

                   'correctAnswer': 'A',

                   'explanation': 'A non-none transform can establish a new stacking context.'},

                  {'questionText': 'What does clamp() allow?',

                   'optionA': 'A value bounded by minimum, preferred, and maximum',

                   'optionB': 'Only color clamping',

                   'optionC': 'Only animation',

                   'optionD': 'Only integer rounding',

                   'correctAnswer': 'A',

                   'explanation': 'clamp(min, preferred, max) bounds a value.'},

                  {'questionText': 'Which selector has higher specificity?',

                   'optionA': 'element selector',

                   'optionB': 'class selector',

                   'optionC': 'id selector',

                   'optionD': 'universal selector',

                   'correctAnswer': 'C',

                   'explanation': 'An id selector has higher specificity than class and element selectors.'}]},

 'Aptitude': {'easy': [{'questionText': 'What is 20% of 250?',

                        'optionA': '25',

                        'optionB': '40',

                        'optionC': '50',

                        'optionD': '60',

                        'correctAnswer': 'C',

                        'explanation': '20% of 250 is 50.'},

                       {'questionText': 'A train travels 60 km in 1.5 hours. What is its average speed?',

                        'optionA': '30 km/h',

                        'optionB': '40 km/h',

                        'optionC': '45 km/h',

                        'optionD': '90 km/h',

                        'correctAnswer': 'B',

                        'explanation': 'Speed = distance/time = 60/1.5 = 40 km/h.'},

                       {'questionText': 'If 3 pens cost ₹45, what is the cost of 8 pens at the same rate?',

                        'optionA': '₹90',

                        'optionB': '₹100',

                        'optionC': '₹120',

                        'optionD': '₹135',

                        'correctAnswer': 'C',

                        'explanation': 'One pen costs ₹15, so 8 cost ₹120.'},

                       {'questionText': 'What is the next number: 2, 4, 8, 16, ?',

                        'optionA': '20',

                        'optionB': '24',

                        'optionC': '32',

                        'optionD': '36',

                        'correctAnswer': 'C',

                        'explanation': 'Each term is doubled.'},

                       {'questionText': 'If x + 7 = 19, what is x?',

                        'optionA': '10',

                        'optionB': '11',

                        'optionC': '12',

                        'optionD': '13',

                        'correctAnswer': 'C',

                        'explanation': 'Subtract 7 from both sides.'}],

              'medium': [{'questionText': 'A product costs ₹800 and is sold for ₹920. What is the profit percentage?',

                          'optionA': '10%',

                          'optionB': '12%',

                          'optionC': '15%',

                          'optionD': '20%',

                          'correctAnswer': 'C',

                          'explanation': 'Profit is ₹120; 120/800 × 100 = 15%.'},

                         {'questionText': 'A can complete a job in 12 days and B in 18 days. Working together, how '

                                          'long do they take?',

                          'optionA': '6 days',

                          'optionB': '7.2 days',

                          'optionC': '8 days',

                          'optionD': '9 days',

                          'correctAnswer': 'B',

                          'explanation': 'Combined rate is 1/12 + 1/18 = 5/36, so time is 36/5 = 7.2 days.'},

                         {'questionText': 'The average of 12, 18, 20 and 30 is:',

                          'optionA': '18',

                          'optionB': '20',

                          'optionC': '22',

                          'optionD': '24',

                          'correctAnswer': 'B',

                          'explanation': 'Their sum is 80 and 80/4 = 20.'},

                         {'questionText': 'If a number is increased by 25% to become 250, what was the original '

                                          'number?',

                          'optionA': '180',

                          'optionB': '200',

                          'optionC': '210',

                          'optionD': '225',

                          'correctAnswer': 'B',

                          'explanation': 'Original × 1.25 = 250, so original = 200.'},

                         {'questionText': 'A ratio is 3:5 and the total is 64. What is the larger part?',

                          'optionA': '24',

                          'optionB': '32',

                          'optionC': '40',

                          'optionD': '48',

                          'correctAnswer': 'C',

                          'explanation': '8 parts correspond to 64, so one part is 8 and the larger part is 40.'}],

              'hard': [{'questionText': 'A pipe fills a tank in 6 hours and another empties it in 9 hours. If both are '

                                        'opened, how long to fill?',

                        'optionA': '12 hours',

                        'optionB': '15 hours',

                        'optionC': '18 hours',

                        'optionD': '54 hours',

                        'correctAnswer': 'C',

                        'explanation': 'Net rate is 1/6 - 1/9 = 1/18 tank/hour.'},

                       {'questionText': 'A sum becomes ₹13,310 at 10% compound interest per year in 3 years. What was '

                                        'the principal?',

                        'optionA': '₹9,000',

                        'optionB': '₹10,000',

                        'optionC': '₹11,000',

                        'optionD': '₹12,000',

                        'correctAnswer': 'B',

                        'explanation': '10,000 × 1.1³ = 13,310.'},

                       {'questionText': 'If 5 workers finish a job in 24 days, how many workers are needed for the '

                                        'same job in 15 days?',

                        'optionA': '6',

                        'optionB': '7',

                        'optionC': '8',

                        'optionD': '10',

                        'correctAnswer': 'C',

                        'explanation': 'Workers are inversely proportional to days: 5×24/15 = 8.'},

                       {'questionText': 'A boat moves 18 km/h downstream and 10 km/h upstream. What is the speed in '

                                        'still water?',

                        'optionA': '4 km/h',

                        'optionB': '8 km/h',

                        'optionC': '14 km/h',

                        'optionD': '16 km/h',

                        'correctAnswer': 'C',

                        'explanation': 'Still-water speed is (18+10)/2 = 14 km/h.'},

                       {'questionText': 'A number leaves remainder 3 when divided by 5. Which expression always has '

                                        'remainder 3 when divided by 5?',

                        'optionA': 'n+5',

                        'optionB': 'n+2',

                        'optionC': '2n',

                        'optionD': 'n-1',

                        'correctAnswer': 'A',

                        'explanation': 'Adding a multiple of 5 does not change the remainder.'}]}}

# Coding problems are generated separately so the same exam can contain

# aptitude/technical MCQs and coding questions in different languages.

CODING_BANK = {'Java': [('Write a program to print the sum of two integers.', 'Read two integers and print their sum.', '2 3', '5'),

          ('Write a program to determine whether an integer is even or odd.',

           'Read an integer and print Even if divisible by 2, otherwise Odd.',

           '7',

           'Odd'),

          ('Write a program to find the maximum of three integers.',

           'Read three integers and print the largest value.',

           '4 9 2',

           '9')],

 'Python': [('Write a program to print the sum of two integers.', 'Read two integers and print their sum.', '2 3', '5'),

            ('Write a program to count vowels in a lowercase word.',

             'Read a lowercase word and print the number of vowels a,e,i,o,u.',

             'education',

             '5'),

            ('Write a program to reverse a string.', 'Read a string and print it in reverse order.', 'hello', 'olleh')],

 'C': [('Write a program to calculate the factorial of a non-negative integer.',

        'Read n and print n factorial.',

        '5',

        '120'),

       ('Write a program to find the largest of three integers.',

        'Read three integers and print the largest.',

        '4 9 2',

        '9'),

       ('Write a program to check whether an integer is prime.', 'Read n and print Prime or Not Prime.', '7', 'Prime')],

 'C++': [('Write a program to calculate the factorial of a non-negative integer.',

          'Read n and print n factorial.',

          '5',

          '120'),

         ('Write a program to find the sum of elements in an array.',

          'Read n followed by n integers and print their sum.',

          '4 1 2 3 4',

          '10'),

         ('Write a program to reverse a string.', 'Read a string and print it reversed.', 'hello', 'olleh')],

 'JavaScript': [('Write a program to print the sum of two integers.',

                 'Read two integers and print their sum.',

                 '2 3',

                 '5'),

                ('Write a program to find the largest number in an array.',

                 'Read n values and print the largest value.',

                 '4 2 9 1 5',

                 '9'),

                ('Write a program to reverse a string.', 'Read a string and print its reverse.', 'hello', 'olleh')],

 'SQL': [('Write a query to find employees whose salary is greater than 50000.',

          'Given an employees table, return rows whose salary is greater than 50000.',

          'employees(salary)',

          'Rows with salary > 50000'),

         ('Write a query to count employees in each department.',

          'Group employees by department and return the department and employee count.',

          'employees(department_id)',

          'department_id, COUNT(*)'),

         ('Write a query to find the maximum salary.',

          'Return the highest salary from employees.',

          'employees(salary)',

          'MAX(salary)'),

         ('Write a query to find employees in department 10.', 'Return rows from employees where department_id = 10.', 'employees(department_id)', 'WHERE department_id = 10'),

         ('Write a query to calculate average salary.', 'Return the average salary from employees.', 'employees(salary)', 'AVG(salary)')]}

def _normalize_question_count(count, default=5, maximum=50):
    """Convert the requested question count to a safe integer."""
    try:
        count = int(count)
    except (TypeError, ValueError):
        count = default

    return max(1, min(count, maximum))

def generate_questions(topic, difficulty, count):
    """Generate exactly the requested number of MCQs."""
    topic_bank = QUESTION_BANK.get(topic)
    if not topic_bank:
        return []

    difficulty_bank = topic_bank.get(difficulty)
    if not difficulty_bank:
        return []

    pool = difficulty_bank[:]
    if not pool:
        return []

    count = _normalize_question_count(count)
    selected = []

    while len(selected) < count:
        cycle_pool = pool[:]
        random.shuffle(cycle_pool)

        for item in cycle_pool:
            if len(selected) >= count:
                break

            question = dict(item)
            question['questionType'] = 'MCQ'
            question['marks'] = 1
            question['difficulty'] = difficulty
            question['topic'] = topic

            selected.append(question)

    return selected

def get_starter_code(language):
    """Return professional starter/boilerplate code for a coding question."""
    starter_codes = {
        "Python": """import sys


def main():
    # Read input from standard input
    data = sys.stdin.read().strip()

    # Write your solution here
    # Example:
    # print(data)


if __name__ == "__main__":
    main()
""",
        "Java": """import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        // Read input from standard input
        String input = br.readLine();

        // Write your solution here

    }
}
""",
        "C++": """#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    // Read input from standard input

    // Write your solution here

    return 0;
}
""",
        "C": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Read input from standard input

    // Write your solution here

    return 0;
}
""",
        "JavaScript": """const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim();

// Write your solution here

""",
        "SQL": """-- Write your SQL query below.
-- Use the tables and columns described in the problem statement.

SELECT *
FROM employees;
"""
    }
    return starter_codes.get(language, "")


def generate_coding_questions(language, difficulty, count):
    """Generate exactly the requested number of coding questions."""
    templates = CODING_BANK.get(language, [])
    if not templates:
        return []

    count = _normalize_question_count(count)
    selected = []

    while len(selected) < count:
        pool = templates[:]
        random.shuffle(pool)

        for title, statement, sample_input, sample_output in pool:
            if len(selected) >= count:
                break

            selected.append({
                "questionText": title,
                "questionType": "CODING",
                "marks": 5,
                "difficulty": difficulty,
                "topic": language,
                "programmingLanguage": language,
                "starterCode": get_starter_code(language),
                "problemStatement": statement,
                "sampleInput": sample_input,
                "sampleOutput": sample_output,
                "testCases": json.dumps([
                    {
                        "input": sample_input,
                        "output": sample_output,
                        "expectedOutput": sample_output
                    }
                ])
            })

    return selected

# ============================================================

# CHEATING DETECTION

# ============================================================

@app.route('/detect_cheating', methods=['POST'])

def detect_cheating():

    try:

        data = request.json or {}

        frame_base64 = data.get('frame')

        exam_id = data.get('examId')

        user_id = data.get('userId')

        if not frame_base64:

            return jsonify({

                'cheatingDetected': False,

                'confidence': 0.0,

                'message': 'No frame received'

            }), 400

        frame_data = base64.b64decode(

            frame_base64.split(',')[1]

            if ',' in frame_base64

            else frame_base64

        )

        tmp_path = None

        try:

            with tempfile.NamedTemporaryFile(

                delete=False,

                suffix='.jpg'

            ) as tmp:

                tmp.write(frame_data)

                tmp_path = tmp.name

            result = cheating_detector.detect(

                tmp_path

            )

            return jsonify(result)

        finally:

            if tmp_path and os.path.exists(tmp_path):

                os.unlink(tmp_path)

    except Exception as e:

        print(

            f"Error in cheating detection: {e}"

        )

        return jsonify({

            'cheatingDetected': False,

            'confidence': 0.0,

            'message': 'Detection failed'

        })

# ============================================================

# CODE EVALUATION

# ============================================================

@app.route('/evaluate_code', methods=['POST'])

def evaluate_code():

    try:

        data = request.json or {}

        code = data.get('code')

        test_cases = data.get('testCases')

        total_marks = data.get('totalMarks')
        language = data.get('language', 'Python')

        if isinstance(test_cases, str):

            test_cases = json.loads(test_cases)

        result = code_evaluator.evaluate(

            code,

            test_cases,

            total_marks,

            language

        )

        return jsonify(result)

    except Exception as e:

        print(

            f"Error in code evaluation: {e}"

        )

        return jsonify({

            'marks': 0,

            'feedback': 'Evaluation failed',

            'testResults': []

        })

# ============================================================

# GENERATE QUESTIONS

# ============================================================

@app.route('/generate_questions', methods=['POST'])

def generate_questions_api():

    try:

        data = request.json or {}

        topic = data.get('topic', 'Java')

        question_type = str(data.get('questionType', 'MCQ')).strip().upper()

        language = str(data.get('language', topic)).strip()

        difficulty = data.get('difficulty', 'medium')

        count = data.get(

            'count',

            5

        )

        topic = str(topic).strip()

        difficulty = str(

            difficulty

        ).strip().lower()

        try:

            count = int(count)

        except (TypeError, ValueError):

            count = 5

        count = max(

            1,

            min(count, 10)

        )

        if question_type == 'CODING':

            questions = generate_coding_questions(language, difficulty, count)

            response_topic = language

        else:

            questions = generate_questions(topic, difficulty, count)

            response_topic = topic

        if not questions:

            return jsonify({

                'success': False,

                'message': (

                    'No question templates are available '

                    f'for topic "{response_topic}" and difficulty '

                    f'"{difficulty}" and question type "{question_type}".'

                ),

                'questions': []

            }), 400

        return jsonify({

            'success': True,

            'topic': response_topic,

            'questionType': question_type,

            'difficulty': difficulty,

            'count': len(questions),

            'questions': questions

        })

    except Exception as e:

        print(

            f"Question generation error: {e}"

        )

        return jsonify({

            'success': False,

            'message': 'Question generation failed',

            'questions': []

        }), 500

# ============================================================

# HEALTH CHECK

# ============================================================

@app.route('/health', methods=['GET'])

def health():

    return jsonify({

        'status': 'healthy'

    })

# ============================================================

# MAIN

# ============================================================

if __name__ == '__main__':

    app.run(

        host='0.0.0.0',

        port=5000,

        debug=True

    )
