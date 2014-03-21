<?php

class scoresAndPercentages
{

    function render( &$data, $ref)
    {
        require_once("./features/utils.php");
        require_once("./features/utils.php");
        $temp           = 'temp/';
        $datastring     = $data['get_all_question_props'];
        $datastring     = str_replace('\\\'', '\'', $datastring);
        $all_questions  = json_decode($datastring);
        $scoresAndPercentages_docx = new CreateDocx();
        $categories     = array();
        
        $paramsTitle = array(
                'val' => 2,
            );
        
        //create array iso object
        $all_questions_array = array();
        foreach($all_questions as $question_number=>$question){
            $all_questions_array[intval($question_number)] = $question;
        };
        ksort($all_questions_array);
        //get all categories
        foreach($all_questions_array as $question_number=>$question){
            $invalid_question_types = array('KIND_GROEP', 'KIND_GRP_BELGIE','JONGEN_MEIJSE', 'JONGEN_MEISJE' ,'BEVOLKINGSGROEP','OUDERS_SCHOOLOPLEIDING', 'PTP_GENDER', 'PTP_AGE','SCHOOLOPLEIDING_OUDERS_BELGIE', 'NATIONALITEIT_BELGIE', 'KIND_GROEP_BELGIE');
            if (in_array($question->{'question_type'}[0][1], $invalid_question_types)){
//                continue;
            }
            if (!in_array($question->{'group_name'}, $categories)){
                $categories[$question->{'group_name'}] = $question->{'group_name'};
            }
        }        
        
        $docx_array = array();
        //loop through categories to create docxs
        foreach($categories as $groupname => $category){
            $percentages = new percentages();
            $docx_array[$groupname." percentages"] = $percentages -> render($data, $ref, $category);
            unset($percentages);
            
            $scores = new scores();
            $docx_array[$groupname. " scores"] = $scores -> render($data, $ref, $category);
            unset($scores);
        
        }
//        $this->_error_dump($docx_array);
        //loop through docxs
        $count = 0;
        $old_groupname = '';
        foreach($docx_array as $groupname => $sap_docx){
            //create group heading
            if ($sap_docx != null){
                $filteredgroupname = str_replace(array('percentages','scores'), array('',''), $groupname);
                if ($filteredgroupname != $old_groupname){
                    $old_groupname = $filteredgroupname;
                    $count++;
                }
                $scoresAndPercentages_docx->addText(array(array(
                    'text' => 'Rubriek '.$count.' '.filter_text($groupname), 
                    'b' => 'single', 
                    'color' => 'F78E1E',
                    'sz' => 10,
                    'font' => 'Century Gothic',
                )));
                $scoresAndPercentages_docx->addBreak('line');
                $scoresAndPercentages_docx->addDOCX($sap_docx);                   
                $scoresAndPercentages_docx->addBreak('page');
            }
        }
		$filename = $temp.'scoresAndPercentages'.randchars(12);
        $scoresAndPercentages_docx->createDocx($filename);
        unset($scoresAndPercentages_docx);
        foreach($docx_array as $groupname => $sap_docx){
            if ($sap_docx != null){
    			unlink($sap_docx);
            }
		}
        return $filename.'.docx';
        
    }
    function _error_dump($object) {
        ob_start();
        var_dump($object);
        $contents = ob_get_contents();
        ob_end_clean();
        error_log($contents);
    }

    

}
