<?php

class questionProperties
{

    function process( &$data, &$docx)
    {
        require_once("./features/utils.php");
        $temp           = 'temp/';
        $datastring     = $data['get_all_question_props'];
        //konqord JSON is false becuse escape character on '
        //konqord JSON is false becuse escape character on '
        $datastring     = str_replace('\\\'', '\'', $datastring);
        $all_questions  = json_decode($datastring);

        //create array iso object
        $all_questions_array = array();
        foreach($all_questions as $question_number=>$question){
            $all_questions_array[intval($question_number)] = $question;
        };
        
        ksort($all_questions_array);
        foreach($all_questions_array as $question_number=>$question){
            $question_id = $question->{'id'};
            if (!isset($question->{'statistics'}->{"percentage"} )){
                continue;
            }
            foreach ($question->{'statistics'}->{"percentage"} as $answer => $percentages) {
                foreach (array('value', 'lt', 'gte') as $modifier){
                    foreach(array('peiling','alle_scholen') as $peiling){
                        $percentage = $percentages->{$modifier}->{$peiling}; 
                        $docx -> addTemplateVariable("class:questionProperties:$question_number:$modifier:$answer:$peiling", strval($percentage));
                        $docx -> addTemplateVariable("class:questionProperties:id:$question_id:$modifier:$answer:$peiling", strval($percentage));
                    }
                }
            }
            if (count($question->{'statistics'}->{"averages"}->{'peiling'})>0){
                $average_peiling = $question->{'statistics'}->{"averages"}->{'peiling'}[0][3]; //should come from data
                $number_of_respondents_peiling = $question->{'statistics'}->{"averages"}->{'peiling'}[0][5]; //should come from data
                $docx -> addTemplateVariable("class:questionProperties:$question_number:average:peiling", sprintf('%.2f',$average_peiling));
                $docx -> addTemplateVariable("class:questionProperties:$question_number:number_of_respondents:peiling", strval($number_of_respondents_peiling));
                $docx -> addTemplateVariable("class:questionProperties:id:$question_id:average:peiling", sprintf('%.2f',$average_peiling));
                $docx -> addTemplateVariable("class:questionProperties:id:$question_id:number_of_respondents:peiling", strval($number_of_respondents_peiling));

                if (isset($question->{'statistics'}->{"averages"}->{'alle_scholen'}[0])){
                    $average_alle_scholen = $question->{'statistics'}->{"averages"}->{'alle_scholen'}[0][3]; //should come from data
                    $number_of_respondents_alle_scholen = $question->{'statistics'}->{"averages"}->{'alle_scholen'}[0][5]; //should come from data
                    $docx -> addTemplateVariable("class:questionProperties:$question_number:average:alle_scholen", sprintf('%.2f',$average_alle_scholen));
                    $docx -> addTemplateVariable("class:questionProperties:$question_number:number_of_respondents:alle_scholen", strval($number_of_respondents_alle_scholen));
                    $docx -> addTemplateVariable("class:questionProperties:id:$question_id:average:alle_scholen", sprintf('%.2f',$average_alle_scholen));
                    $docx -> addTemplateVariable("class:questionProperties:id:$question_id:number_of_respondents:alle_scholen", strval($number_of_respondents_alle_scholen));
    
                    $difference = ($average_peiling == $average_alle_scholen) ? "gelijk aan" : ($average_peiling > $average_alle_scholen)
                                    ? sprintf("%.2f punt hoger dan", sprintf('%.2f',$average_peiling) - sprintf('%.2f',$average_alle_scholen))
                                    : sprintf("%.2f punt lager dan", sprintf('%.2f',$average_alle_scholen) - sprintf('%.2f',$average_peiling));
                    $docx -> addTemplateVariable("class:questionProperties:$question_number:difference", $difference);
                    $docx -> addTemplateVariable("class:questionProperties:id:$question_id:difference", $difference);
                                    }
                
            }
                    
                

        }        
        return $docx;
        
    }
    function _error_dump($object) {
        ob_start();
        //var_dump($object);
        $contents = ob_get_contents();
        ob_end_clean();
        error_log($contents);
    }

    

}
