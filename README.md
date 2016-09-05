# UNDER HEAVY DEVELOPMENT! DO NOT USE!

[![Build Status](https://travis-ci.org/ITDSystems/alvex-reports.svg?branch=master)](https://travis-ci.org/ITDSystems/alvex-reports)

Alvex reports
========================

Alvex Reports component designed to see documents registration statistics and to create custom reports on documents processing.

Build
-----
Option 1:
Build it via [alvex-meta](https://github.com/ITDSystems/alvex-meta). It allows to build a stable version with all dependencies inside the package.
 
Option 2:
Build from this repo. The component may be packaged in two ways: *amp* and *jar*.
To build amp use `mvn clean package`, to build installable jar use `mvn -P make-jar clean package`.

**Note!**
Don't forget to build and install dependecies! This component depends on [alvex-common](https://github.com/ITDSystems/alvex-common) so you should install it first.

**Note**: this project requires Maven 3.3.9 at least.
