import subprocess
import tempfile
import os
import shutil


class CodeEvaluator:

    def evaluate(
        self,
        code,
        test_cases,
        total_marks,
        language="Python"
    ):
        """
        Evaluate submitted code against test cases.

        Supported languages:
        - Python
        - Java
        - C++
        - C
        - JavaScript

        Marks are calculated according to the percentage
        of test cases passed.
        """

        try:
            # --------------------------------------------------
            # Validate input
            # --------------------------------------------------

            if (
                not code
                or not test_cases
                or total_marks is None
            ):
                return {
                    "results": [],
                    "totalMarks": total_marks or 0,
                    "marksObtained": 0,
                    "passedTests": 0,
                    "totalTests": 0,
                    "message": "Invalid input data"
                }

            # --------------------------------------------------
            # Normalize language
            # --------------------------------------------------

            language = self.normalize_language(language)

            supported_languages = {
                "Python",
                "Java",
                "C++",
                "C",
                "JavaScript"
            }

            if language not in supported_languages:
                return {
                    "results": [],
                    "totalMarks": total_marks,
                    "marksObtained": 0,
                    "passedTests": 0,
                    "totalTests": len(test_cases),
                    "message": (
                        f"{language} execution is not supported."
                    )
                }

            # --------------------------------------------------
            # Create isolated temporary working directory
            # --------------------------------------------------

            work_dir = tempfile.mkdtemp(
                prefix="exampro_code_"
            )

            try:

                # --------------------------------------------------
                # Prepare source code
                # --------------------------------------------------

                preparation = self.prepare_code(
                    language,
                    code,
                    work_dir
                )

                if not preparation["success"]:

                    return {
                        "results": [],
                        "totalMarks": total_marks,
                        "marksObtained": 0,
                        "passedTests": 0,
                        "totalTests": len(test_cases),
                        "message": preparation["message"]
                    }

                run_command = preparation["command"]

                # --------------------------------------------------
                # Execute test cases
                # --------------------------------------------------

                results = []
                passed_tests = 0

                for index, test in enumerate(
                    test_cases,
                    start=1
                ):

                    input_data = str(
                        test.get("input", "")
                    )

                    # Support both names so existing data
                    # remains compatible.
                    expected_output = test.get(
                        "expectedOutput"
                    )

                    if expected_output is None:
                        expected_output = test.get(
                            "output",
                            ""
                        )

                    expected_output = str(
                        expected_output
                    ).strip()

                    try:

                        process = subprocess.run(
                            run_command,
                            input=input_data.encode(
                                "utf-8"
                            ),
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            timeout=5,
                            cwd=work_dir
                        )

                        actual_output = (
                            process.stdout.decode(
                                "utf-8",
                                errors="replace"
                            ).strip()
                        )

                        error_output = (
                            process.stderr.decode(
                                "utf-8",
                                errors="replace"
                            ).strip()
                        )

                        # --------------------------------------------------
                        # Runtime / execution error
                        # --------------------------------------------------

                        if process.returncode != 0:

                            results.append({
                                "testCase": index,
                                "input": input_data,
                                "expectedOutput": expected_output,
                                "actualOutput": (
                                    error_output
                                    or "Runtime error"
                                ),
                                "passed": False
                            })

                            continue

                        # --------------------------------------------------
                        # Compare output
                        # --------------------------------------------------

                        passed = (
                            self.normalize_output(
                                actual_output
                            )
                            ==
                            self.normalize_output(
                                expected_output
                            )
                        )

                        if passed:
                            passed_tests += 1

                        results.append({
                            "testCase": index,
                            "input": input_data,
                            "expectedOutput": expected_output,
                            "actualOutput": actual_output,
                            "passed": passed
                        })

                    except subprocess.TimeoutExpired:

                        results.append({
                            "testCase": index,
                            "input": input_data,
                            "expectedOutput": expected_output,
                            "actualOutput": (
                                "Execution timed out "
                                "(maximum 5 seconds)"
                            ),
                            "passed": False
                        })

                    except Exception as test_error:

                        results.append({
                            "testCase": index,
                            "input": input_data,
                            "expectedOutput": expected_output,
                            "actualOutput": str(
                                test_error
                            ),
                            "passed": False
                        })

                # --------------------------------------------------
                # Calculate marks
                # --------------------------------------------------

                total_tests = len(test_cases)

                if total_tests > 0:

                    marks_obtained = (
                        passed_tests
                        / total_tests
                    ) * float(total_marks)

                else:

                    marks_obtained = 0

                marks_obtained = round(
                    marks_obtained,
                    2
                )

                # --------------------------------------------------
                # Final response
                # --------------------------------------------------

                return {
                    "results": results,
                    "totalMarks": total_marks,
                    "marksObtained": marks_obtained,
                    "passedTests": passed_tests,
                    "totalTests": total_tests,
                    "message": "Evaluation completed"
                }

            finally:

                # --------------------------------------------------
                # Delete temporary files
                # --------------------------------------------------

                shutil.rmtree(
                    work_dir,
                    ignore_errors=True
                )

        except Exception as error:

            print(
                f"Evaluation error: {error}"
            )

            return {
                "results": [],
                "totalMarks": total_marks or 0,
                "marksObtained": 0,
                "passedTests": 0,
                "totalTests": (
                    len(test_cases)
                    if test_cases
                    else 0
                ),
                "message": (
                    f"Evaluation failed: {error}"
                )
            }

    # ==========================================================
    # LANGUAGE NORMALIZATION
    # ==========================================================

    def normalize_language(self, language):

        if not language:
            return "Python"

        value = str(
            language
        ).strip().lower()

        language_map = {
            "python": "Python",
            "py": "Python",

            "java": "Java",

            "c++": "C++",
            "cpp": "C++",

            "c": "C",

            "javascript": "JavaScript",
            "js": "JavaScript"
        }

        return language_map.get(
            value,
            language
        )

    # ==========================================================
    # PREPARE CODE
    # ==========================================================

    def prepare_code(
        self,
        language,
        code,
        work_dir
    ):

        try:

            # ==================================================
            # PYTHON
            # ==================================================

            if language == "Python":

                source_path = os.path.join(
                    work_dir,
                    "main.py"
                )

                with open(
                    source_path,
                    "w",
                    encoding="utf-8"
                ) as file:

                    file.write(code)

                return {
                    "success": True,
                    "command": [
                        "python",
                        source_path
                    ]
                }

            # ==================================================
            # JAVA
            # ==================================================

            if language == "Java":

                source_path = os.path.join(
                    work_dir,
                    "Main.java"
                )

                with open(
                    source_path,
                    "w",
                    encoding="utf-8"
                ) as file:

                    file.write(code)

                compile_process = subprocess.run(
                    [
                        "javac",
                        source_path
                    ],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10,
                    cwd=work_dir
                )

                if compile_process.returncode != 0:

                    error = (
                        compile_process.stderr.decode(
                            "utf-8",
                            errors="replace"
                        ).strip()
                    )

                    return {
                        "success": False,
                        "command": [],
                        "message": (
                            "Java compilation failed:\n"
                            + error
                        )
                    }

                return {
                    "success": True,
                    "command": [
                        "java",
                        "-cp",
                        work_dir,
                        "Main"
                    ]
                }

            # ==================================================
            # C++
            # ==================================================

            if language == "C++":

                source_path = os.path.join(
                    work_dir,
                    "main.cpp"
                )

                executable_path = os.path.join(
                    work_dir,
                    "main.exe"
                )

                with open(
                    source_path,
                    "w",
                    encoding="utf-8"
                ) as file:

                    file.write(code)

                compile_process = subprocess.run(
                    [
                        "g++",
                        source_path,
                        "-o",
                        executable_path
                    ],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10,
                    cwd=work_dir
                )

                if compile_process.returncode != 0:

                    error = (
                        compile_process.stderr.decode(
                            "utf-8",
                            errors="replace"
                        ).strip()
                    )

                    return {
                        "success": False,
                        "command": [],
                        "message": (
                            "C++ compilation failed:\n"
                            + error
                        )
                    }

                return {
                    "success": True,
                    "command": [
                        executable_path
                    ]
                }

            # ==================================================
            # C
            # ==================================================

            if language == "C":

                source_path = os.path.join(
                    work_dir,
                    "main.c"
                )

                executable_path = os.path.join(
                    work_dir,
                    "main.exe"
                )

                with open(
                    source_path,
                    "w",
                    encoding="utf-8"
                ) as file:

                    file.write(code)

                compile_process = subprocess.run(
                    [
                        "gcc",
                        source_path,
                        "-o",
                        executable_path
                    ],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10,
                    cwd=work_dir
                )

                if compile_process.returncode != 0:

                    error = (
                        compile_process.stderr.decode(
                            "utf-8",
                            errors="replace"
                        ).strip()
                    )

                    return {
                        "success": False,
                        "command": [],
                        "message": (
                            "C compilation failed:\n"
                            + error
                        )
                    }

                return {
                    "success": True,
                    "command": [
                        executable_path
                    ]
                }

            # ==================================================
            # JAVASCRIPT
            # ==================================================

            if language == "JavaScript":

                source_path = os.path.join(
                    work_dir,
                    "main.js"
                )

                with open(
                    source_path,
                    "w",
                    encoding="utf-8"
                ) as file:

                    file.write(code)

                return {
                    "success": True,
                    "command": [
                        "node",
                        source_path
                    ]
                }

            return {
                "success": False,
                "command": [],
                "message": (
                    f"Unsupported language: "
                    f"{language}"
                )
            }

        except subprocess.TimeoutExpired:

            return {
                "success": False,
                "command": [],
                "message": (
                    "Compilation timed out."
                )
            }

        except Exception as error:

            return {
                "success": False,
                "command": [],
                "message": (
                    f"Code preparation failed: "
                    f"{error}"
                )
            }

    # ==========================================================
    # OUTPUT NORMALIZATION
    # ==========================================================

    def normalize_output(self, output):

        """
        Normalizes output before comparison.

        This prevents harmless differences such as:
        - extra spaces
        - trailing spaces
        - blank lines

        from causing a test failure.
        """

        lines = []

        for line in str(output).splitlines():

            cleaned = line.strip()

            if cleaned:
                lines.append(cleaned)

        return "\n".join(lines)