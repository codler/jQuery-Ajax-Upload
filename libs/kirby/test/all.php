<?php

// NOTE:
// to run these tests, download simpletest (http://www.simpletest.org/)
// and place it outside (but at the same level) of the kirby directory.
//
require_once(dirname(__file__) . '/../../simpletest/unit_tester.php');
require_once(dirname(__file__) . '/../../simpletest/reporter.php');
require_once('session.php');
require_once('string.php');
require_once('array.php');

$test = new SessionTest();
$test->run(new HtmlReporter());
$test = new StringTest();
$test->run(new HtmlReporter());
$test = new ArrayTest();
$test->run(new HtmlReporter());
