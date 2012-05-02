<?php
/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @version //autogentag//
 * @filesource
 * @package Translation
 */

/**
 * Implements the Bork translation filter.
 *
 * The bork filter mangles text in cases where the translatable string is
 * defined in the translation definition, but when it it marked as an
 * "unfinished" translation.  This makes it obvious which text is translatable,
 * but not yet translated.
 *
 * @package Translation
 * @version //autogentag//
 */
class ezcTranslationBorkFilter implements ezcTranslationFilter
{
    /**
     * @param ezcTranslationBorkFilter Instance
     */
    static private $instance = null;

    /**
     * Private constructor to prevent non-singleton use
     */
    private function __construct()
    {
    }

    /**
     * Returns an instance of the class ezcTranslationFilterBork
     *
     * @return ezcTranslationFilterBork Instance of ezcTranslationFilterBork
     */
    public static function getInstance()
    { 
        if ( is_null( self::$instance ) ) 
        { 
            self::$instance = new ezcTranslationBorkFilter(); 
        } 
        return self::$instance; 
    }

    /**
     * This "borkifies" the $text.
     *
     * @param string $text
     * @return string
     */
    static private function borkify( $text )
    {
        $textBlocks = preg_split( '/(%[^ ]+)/', $text, -1, PREG_SPLIT_DELIM_CAPTURE );
        $newTextBlocks = array();
        foreach ( $textBlocks as $text )
        {
            if ( strlen( $text ) && $text[0] == '%' )
            {
                $newTextBlocks[] = (string) $text;
                continue;
            }

            $orgtext = $text;

            $searchMap = array(
                '/au/', '/\Bu/', '/\Btion/', '/an/', '/a\B/', '/en\b/',
                '/\Bew/', '/\Bf/', '/\Bir/', '/\Bi/', '/\bo/', '/ow/', '/ph/',
                '/th\b/', '/\bU/', '/y\b/', '/v/', '/w/', '/ooo/',
            );
            $replaceMap = array(
                'oo', 'oo', 'shun', 'un', 'e', 'ee',
                'oo', 'ff', 'ur', 'ee', 'oo', 'oo', 'f',
                't', 'Oo', 'ai', 'f', 'v', 'oo',
            );
            $text = preg_replace( $searchMap, $replaceMap, $text );

            if ( $orgtext == $text && count( $newTextBlocks ) )
            {
                $text .= '-a';
            }
            $newTextBlocks[] = (string) $text;
        }
        $text = implode( '', $newTextBlocks );
        $text = preg_replace( '/([:.?!])(.*)/', '\\2\\1', $text );
        return "[$text]";
    }

    /**
     * Filters a context
     *
     * Applies the "bork" filter on the given context. The bork filter mangles
     * non-finished or non-translated text so that it is obvious which text is
     * translatable, but not yet translated.
     *
     * @param array(ezcTranslationData) $context
     * @return void
     */
    public function runFilter( array $context )
    {
        foreach ( $context as $element )
        {
            if ( $element->status !== ezcTranslationData::TRANSLATED )
            {
                $element->translation = self::borkify( $element->original );
            }
        }
    }
}
?>