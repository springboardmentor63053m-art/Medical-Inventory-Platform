@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.0
@REM ----------------------------------------------------------------------------

@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%
@if "%MAVEN_BATCH_PAUSE%" == "on" set MAVEN_BATCH_PAUSE_STR=pause

@setlocal

@set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
@if "%MAVEN_PROJECTBASEDIR%" == "" set MAVEN_PROJECTBASEDIR=%~dp0
@if "%MAVEN_PROJECTBASEDIR%" == "" set MAVEN_PROJECTBASEDIR=%CD%

@REM Strip trailing backslash to prevent escaping issues with double quotes
@if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

@set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@REM Find java.exe
@if defined JAVA_HOME goto findJavaFromJavaHome

@set JAVACMD=java.exe
%JAVACMD% -version >nul 2>&1
@if "%ERRORLEVEL%" == "0" goto init

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
echo.
goto error

:findJavaFromJavaHome
@set JAVACMD=%JAVA_HOME%\bin\java.exe
@if exist "%JAVACMD%" goto init

@set JAVACMD=java.exe
%JAVACMD% -version >nul 2>&1
@if "%ERRORLEVEL%" == "0" goto init

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
echo.
goto error

:init
@REM Check if wrapper jar exists
@if exist %WRAPPER_JAR% goto run

@REM Download wrapper jar if missing using PowerShell
echo Downloading Maven Wrapper JAR...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.0/maven-wrapper-3.3.0.jar', '%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar')"
@if errorlevel 1 goto error

:run
@set JVM_CONFIG="%MAVEN_PROJECTBASEDIR%\.mvn\jvm.config"
@if exist %JVM_CONFIG% (
  for /F "usebackq delims=" %%a in (%JVM_CONFIG%) do set JVM_CONFIG_ARGS=%%a
)

@set MAVEN_CONFIG="%MAVEN_PROJECTBASEDIR%\.mvn\maven.config"
@if exist %MAVEN_CONFIG% (
  for /F "usebackq delims=" %%a in (%MAVEN_CONFIG%) do set MAVEN_CONFIG_ARGS=%%a
)

@set MAVEN_OPTS=%MAVEN_OPTS% %JVM_CONFIG_ARGS%

"%JAVACMD%" %MAVEN_OPTS% -classpath %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %MAVEN_CONFIG_ARGS% %*
@if errorlevel 1 goto error
@goto end

:error
@set ERRORLEVEL=%ERRORLEVEL%
@if "%MAVEN_BATCH_PAUSE%" == "on" %MAVEN_BATCH_PAUSE_STR%
@exit /B %ERRORLEVEL%

:end
@endlocal
