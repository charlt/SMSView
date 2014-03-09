<?php

class satisfactionBestuur
{

    function render( &$data, $ref, $type='satisfaction')
    {
        require_once("./pChart/class/pData.class.php");
        require_once("./pChart/class/pDraw.class.php");
        require_once("./pChart/class/pImage.class.php");
        require_once("./features/utils.php");
        $temp           = 'temp/';
        $datastring     = $data['table.satisfaction.data.bestuur'];
        $bestuur_name   = $data['bestuur.name'];
        if (!isset($data['table.satisfaction.data.bestuur'])){
            return 0;
        }
        if (!isset($data["question.type.$type.scalefactor"])){
            return 0;
        }
        $scale_factor = $data["question.type.$type.scalefactor"];
        $importance_categories = get_importance_categories($data);
        $column_count   = 0;
        
        $paramsTextTitles = array(
            'b' => 'double',
            'font' => 'Century Gothic',
            'cell_color' => '00A4E4',
            'sz' => 9.5
         );        
        
        $paramsTextTableHeader = array(
            'color' => 'FFFFFF',
            'font' => 'Century Gothic',
            'b' => 'double',
            'cell_color' => '00A4E4',         
            'sz' => 9.5
        );        

        $paramsTextTableTitle = array(
            'color' => '00A4E4',
            'font' => 'Century Gothic',
            'b' => 'double',
            'cell_color' => 'DAEEF3',//lightbleu
            'sz' => 9.5
        );        
        
        $paramsTextTable = array(
            'color' => '00A4E4',
            'font' => 'Century Gothic',
            'border_color'=>'00A4E4',
            'sz' => 9.5,
            'jc' => 'center'
        );        
        
        $paramsTextTableTitleReference = array(
            'color' => 'F78E1E',
            'font' => 'Century Gothic',
            'b' => 'double',            
            'cell_color' => 'FDE9D9',//lightorange
            'sz' => 9.5
        );        
        
        $paramsTextTableReference = array(
            'color' => 'F78E1E',
            'sz' => 9.5,
            'font' => 'Century Gothic',
            'jc' => 'center'
        );        
        
        $paramsTextTableHeaderReference = array(
            'color' => 'FFFFFF',
            'b' => 'double',
            'font' => 'Century Gothic',
            'cell_color' => 'F78E1E',         
            'sz' => 9.5
        );        

        $widthTableCols = array(
            3200,
            700,
            700
        );

        $paramsTable = array(
            'border' => 'single',
            'border_sz' => 10,
            'border_color'=>'00A4E4',
            'size_col' => $widthTableCols,
            'textWrap'=>0,
        );

        $paramsTableEmpty = array(
            'border' => 'none',
            'size_col' => 100,
        );

        $paramsTableReference = array(
            'border' => 'single',
            'border_sz' => 10,
            'border_color'=>'F78E1E',
            'size_col' => 700,
            'textWrap'=>0,
        );


        
        
        
        //konqord JSON is false becuse escape character on '
        $datastring     = str_replace('\\\'', '\'', $datastring);
        $refs = json_decode($datastring)->{'refs'};
        $satisfaction_data  = json_decode($datastring)->{$type};

        //add graphic to docx
        $satisfaction_docx = new CreateDocx();
        
        //create new array with categorynumber as key
        $satisfaction_array = Array();
        foreach ($refs as $key){
                if ($key == '_empty_'){
                    continue;
                }
                if ($key == ''){
                    continue;
                }
                if ($key == 'locatie_'){
                    continue;
                }
                if (!isset($key)){
                    continue;
                }
                if (($key == 'peiling') || ($key == 'bestuur')){
                    $name = "$bestuur_name ";
                } elseif ($key == 'vorige_peiling') {
                    if (!$ref['vorige_peiling']) continue;
                    $name = "Vorige peiling ".$bestuur_name." ";
                } elseif ($key == 'alle_scholen') {
                    if (!$ref['alle_scholen']) continue;
                    $name ="Alle Scholen ";
                } else  {
//                    $name = $key.' ';
                    continue;
                }
            $satisfaction_column = $satisfaction_data->{$key} ;
            $satisfaction_average = Array();
            foreach ($satisfaction_column as $value) {
                $satisfaction_average[$value[0]] = $value[2];
            }
            $satisfaction_array[$key] = $satisfaction_average;
        }

        $satisfaction_table = array();
        $satisfaction_table_reference = array();
        for ($i=0 ; $i < count($satisfaction_data->{'bestuur'}) ; $i++){
            //do not take categories wich are not ment to be categories:
            if (!in_array($satisfaction_data->{'bestuur'}[$i][0], $importance_categories)){
                continue;
            }
            $category_id = $satisfaction_data->{'bestuur'}[$i][0];
            $count = 0;
 //           $satisfaction_table[$i][$count++] = $i; //number, will be changed after sort
            $paramsTextTable['text'] = filter_text($satisfaction_data->{'bestuur'}[$i][1]);
            $text = $satisfaction_docx->addElement('addText', array($paramsTextTable));
            $satisfaction_table[$i][$count++] = $text; //title
//            foreach ($question->{'refs'} as $reference){
            foreach ($refs as $key){
                if ($key == '_empty_'){
                    continue;
                }
                if ($key == ''){
                    continue;
                }
                if (!isset($key)){
                    continue;
                }
                if ($key == 'locatie_'){
                    continue;
                }
                if (($key == 'peiling') || ($key == 'bestuur')){
                    $name = "$bestuur_name ";
                } elseif ($key == 'vorige_peiling') {
                    if (!$ref['vorige_peiling']) continue;
                    $name = "Vorige peiling ".$bestuur_name." ";
                } elseif ($key == 'alle_scholen') {
                    if (!$ref['alle_scholen']) continue;
                    $name ="Alle Scholen ";
                } else {
//                    $name = $key.' ';
                    continue;
                }

                $satisfaction_column = $satisfaction_data->{$key} ;
                if ($key == 'alle_scholen'){
                    $paramsTextTableReference['text'] = '';
                    $text = $satisfaction_docx->addElement('addText', array());
                    $text->{'border'} = $paramsTableEmpty;
                    $satisfaction_table[$i][$count++] = $text;
                    if ($ref['alle_scholen']){
                        $paramsTextTableReference['text'] = Scale10($satisfaction_array[$key][$category_id], $scale_factor); 
                    } else {
                        $paramsTextTableReference['text'] = '-';
                    }
                    $text = $satisfaction_docx->addElement('addText', array($paramsTextTableReference));
                    $text->{'border'} = $paramsTableReference;
                    $satisfaction_table[$i][$count++] = $text;
                } elseif ($key == 'vorige_peiling'){
                    $previous_number = '-';
                    foreach ($satisfaction_data->{'vorige_peiling'} as $previous){
                        if ($previous[0] == $category_id){
                            $previous_number = Scale10($previous[2], $scale_factor);
                        }
                    }
                    $paramsTextTable['text'] = $previous_number;
                    $text = $satisfaction_docx->addElement('addText', array($paramsTextTable));
                    $text->{'border'} = $paramsTable;
                    $satisfaction_table[$i][$count++] = $text;
                } else {
                    if (count($satisfaction_column) == 0){
                        $paramsTextTable['text'] = 0;
                        $text = $satisfaction_docx->addElement('addText', array($paramsTextTable));
                        $text->{'border'} = $paramsTable;
                        $satisfaction_table[$i][$count++] = $text;
                    } else {
                        
                        $paramsTextTable['text'] = Scale10($satisfaction_array[$key][$category_id], $scale_factor);
                        $text = $satisfaction_docx->addElement('addText', array($paramsTextTable));
                        $text->{'border'} = $paramsTable;
                        $satisfaction_table[$i][$count++] = $text;
                    }
                }
            }
            
        }
        
        $satisfaction_titles = array();
        $text = $satisfaction_docx->addElement('addText', array($paramsTextTableHeader));
        $satisfaction_titles[0][] = $text;
        
        foreach ($refs as $key){
                if ($key == '_empty_'){
                    continue;
                }
                if ($key == ''){
                    continue;
                }
                if (!isset($key)){
                    continue;
                }
                if ($key == 'locatie_'){
                    continue;
                }
                if (($key == 'peiling') || ($key == 'bestuur')){
                    $name = "$bestuur_name ";
                } elseif ($key == 'vorige_peiling') {
                    if (!$ref['vorige_peiling']) continue;
                    $name = "Vorige peiling ".$bestuur_name." ";
                } elseif ($key == 'alle_scholen') {
                    if (!$ref['alle_scholen']) continue;
                } else {
//                    $name = $key.' ';
                    continue;
                }
                $satisfaction_column = $satisfaction_data->{$key} ;
                $column_count++;
                if ($key == 'alle_scholen'){
                    $paramsTextTableReference['text'] = '';
                    $text = $satisfaction_docx->addElement('addText', array());
                    $text->{'border'} = $paramsTableEmpty;
                    $satisfaction_titles[0][] = $text;
                    $paramsTextTableTitleReference['text'] = 'Alle scholen';
                    $text = $satisfaction_docx->addElement('addText', array($paramsTextTableTitleReference));
                    $text->{'border'} = $paramsTableReference;
                    $satisfaction_titles[0][] = $text;
                } else {
                    if ($key == 'bestuur'){
                        $paramsTextTableTitle['text'] = 'Deze peiling';
                    } elseif ($key == 'vorige_peiling'){
                        $paramsTextTableTitle['text'] = 'Vorige peiling';
                    } else {
                        $paramsTextTableTitle['text'] = $name;
                    }
                    $text = $satisfaction_docx->addElement('addText', array($paramsTextTableTitle));
                    $text->{'border'} = $paramsTable;
                    $satisfaction_titles[0][] = $text;
                }
        }
        usort($satisfaction_table, 'cmp_peiling');
        
        
        
        //set right number
        $count = 1;
        for ($i = 0 ; $i < count($satisfaction_table) ; $i++){
            //$satisfaction_table[$i][0] = $count++.'.';
            $satisfaction_table[$i][0]->{'_embeddedText'}[0]["text"] = $count++.'. '.$satisfaction_table[$i][0]->{'_embeddedText'}[0]["text"] ;
            //now do the formatting of the number (should be done AFTER sort)
            for ($j=0 ; $j <= $column_count ; $j++){
                if (isset($satisfaction_table[$i][$j+1]->{'_embeddedText'}[0]["text"])){
                    $value = $satisfaction_table[$i][$j+1]->{'_embeddedText'}[0]["text"];
                    $satisfaction_table[$i][$j+1]->{'_embeddedText'}[0]["text"] = sprintf("%01.1f", $value);
                }
            }
        }
        
        $paramsText = array(
            'b' => 'single',
            'font' => 'Arial'
        );        
        
        $widthTableColsHeader = array(
            4600,
        );

        $paramsTableHeader = array(
            'border' => 'single',
            'border_sz' => 10,
            'border_color'=>'00A4E4',
            'size_col' => $widthTableColsHeader,
            'textWrap'=>0
            
        );

        $satisfaction_header = array();
        $paramsTextTableHeader['text'] = 'Het bestuur';
        $text = $satisfaction_docx->addElement('addText', array($paramsTextTableHeader));
        $text->{'border'} = $paramsTable;
        $satisfaction_header[0][] = $text;
		$header_columns = ($ref['alle_scholen']) ? $column_count-1 : $column_count;
        for ($i=0; $i < $header_columns; $i++){
            $paramsTextTableHeader['text'] = '';
            $text = $satisfaction_docx->addElement('addText', array($paramsTextTableHeader));
            $text->{'border'} = $paramsTable;
            $satisfaction_header[0][] = $text;
        }
        $paramsTextTableHeader['text'] = ' **';
        $text = $satisfaction_docx->addElement('addText', array());
        $text->{'border'} = $paramsTableEmpty;
        $satisfaction_header[0][] = $text;

		if ($ref['alle_scholen']){
	        $paramsTextTableHeaderReference['text'] = 'Referentie';
	        $text = $satisfaction_docx->addElement('addText', array($paramsTextTableHeaderReference));
	        $text->{'border'} = $paramsTableReference;
	        $satisfaction_header[0][] = $text;
		}
        
        
        //$satisfaction_docx->addText($type, $paramsText);
        $table1 = $satisfaction_docx->addTable($satisfaction_header);
        $table2 = $satisfaction_docx->addTable($satisfaction_titles);
        $table3 = $satisfaction_docx->addTable($satisfaction_table);

		$filename = $temp.$type.'Bestuur'.randchars(12);
        $satisfaction_docx->createDocx($filename);
		
        unset($satisfaction_docx);
        return $filename.'.docx';
        
    }
    

}
