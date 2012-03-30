<?php

/**
 * Create a DOCX file. Text example
 *
 * @category   Phpdocx
 * @package    examples
 * @subpackage easy
 * @copyright  Copyright (c) 2009-2011 Narcea Producciones Multimedia S.L.
 *             (http://www.2mdc.com)
 * @license    http://www.phpdocx.com/wp-content/themes/lightword/pro_license.php
 * @version    1.8
 * @link       http://www.phpdocx.com
 * @since      File available since Release 1.8
 */
require_once '../../../classes/pdf/CreatePdf.inc';

$docx = new CreatePdf();

$text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, ' .
    'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut ' .
    'enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut' .
    'aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit ' .
    'in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ' .
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui ' .
    'officia deserunt mollit anim id est laborum.';

$paramsText = array(
    'text' => $text
);
$aTextos = array();
$aTextos[] = $paramsText;
$paramsText = array(
    'jc' => 'centre',
    'text' => $text
);
$aTextos[] = $paramsText;
$paramsText = array(
    'jc' => 'right',
    'text' => $text
);

$aTextos[] = $paramsText;
$paramsText = array(
    'jc' => 'centre',
    'b' => 'single',
    'sz' => '12',
    'text' => $text
);
$aTextos[] = $paramsText;
$paramsText = array(
    'jc' => 'centre',
    'b' => 'single',
    'sz' => '12',
    'color' => 'ff0000',
    'u' => 'dash',
    'i' => 'single',
    'text' => $text
);

$aTextos[] = $paramsText;
$docx->addText($aTextos);

$docx->createPdf();
