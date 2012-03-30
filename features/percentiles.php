<?php

class percentiles
{

    function render( $data, $good='green')
    {
        require_once("./features/utils.php");
        require_once("./pChart/class/pData.class.php");
        require_once("./pChart/class/pDraw.class.php");
        require_once("./pChart/class/pImage.class.php");
        $temp           = 'temp/';
        $datastring     = $data['perctbl.chart.green'];
        //konqord JSON is false becuse escape character on '
        $datastring     = str_replace('\\\'', '\'', $datastring);
        $percentiles_data  = json_decode($datastring)->{$good};


        $percentiles_docx = new CreateDocx();

        //add heading
        $paramsTextHeading = array(
            'sz' => 8,
            'i' => 'single',
            'font' => 'Century Gothic'
        );

        $percentiles_docx->addText('      Onderwerp                                                       Percentiel   Ontevreden                             Tevreden    Score
n', $paramsTextHeading);

        $percentiles_table = array();

        $scores_graphic = array();
        $advice = array();
            foreach($percentiles_data as $key => $percentile){
                $percentile = str_replace("[","",$percentile);
                $percentile = str_replace("]","",$percentile);
                $percentile_data = explode(',',$percentile);
                $count=0;
                foreach($percentile_data as $percentile_parameter){
                    $percentile_parameter = trim($percentile_parameter);
                }
                            //gather data
                //$peiling_averages = $question->{'statistics'}->{'averages'}->{'peiling'}[0];
                //$alle_scholen_averages = $question->{'statistics'}->{'averages'}->{'alle_scholen'}[0];
                $advice[] =$percentile_data[15];
                $names = array(($key+1).'. '.$percentile_data[15], round($percentile_data[0]));
                $min_value = $percentile_data[3];
                $max_value = $percentile_data[4];
                $blocksize = ($max_value - $min_value) / 30;
                $empty = array(($percentile_data[6] - $min_value),($percentile_data[10] -$min_value));
                $stdev_left = array(($percentile_data[7] - $percentile_data[6] - $blocksize),($percentile_data[11] - $percentile_data[10] - $blocksize));
                $block = array(($blocksize),($blocksize));
                $stdev_right = array(($percentile_data[8] - $percentile_data[7] - $blocksize),($percentile_data[12] - $percentile_data[11]  - $blocksize));
                $values = array(sprintf("%01.2f",$percentile_data[7]), sprintf("%01.2f",$percentile_data[11]));
                $answered = array($percentile_data[9], $percentile_data[13]);

                $scores_graphic = $this->_draw_graphic($key, $names, $empty, $stdev_left, $block, $stdev_right, $min_value, $max_value,$values, $answered, $temp);
                $paramsImg = array(
                    'name' => $scores_graphic,
                    'scaling' => 30,
                    'spacingTop' => 0,
                    'spacingBottom' => 0,
                    'spacingLeft' => 0,
                    'spacingRight' => 0,
                    'textWrap' => 0,
                    'border' => 0,
                    'borderDiscontinuous' => 1
                );
                $percentiles_docx->addImage($paramsImg);

            }
            $percentiles_docx->addText('Hieronder staan voorbeelden van conclusies die u op basis van de tabel kunt trekken.');
            $percentiles_docx->addText('Onze school scoort landelijk goed waar het gaat om:');
            $paramsList = array(
                'val' => 1
            );
            array_splice($advice,3);
            $percentiles_docx->addList($advice, $paramsList);


        $paramsPage = array(
            'left'=> 850,
            'right'=> 850,
        );
        $percentiles_docx->createDocx($temp.'percentiles'.$good, $paramsPage);
        unset($percentiles_docx);
        return $temp.'percentiles'.$good.'.docx';

    }
                
    private function _draw_graphic($question_number, $names, $empty, $stdev_left, $block, $stdev_right, $min_value, $max_value,$values, $answered, $temp)
    {
        /* Create and populate the pData object */
        $MyData = new pData();
        $MyData->loadPalette("./pChart/palettes/sms-scores.color", TRUE);
        $MyData->addPoints($empty, "Zero values");
        $MyData->addPoints($stdev_left, "Min values");
        $MyData->addPoints($block, "Values");
        $MyData->addPoints($stdev_right, "max_values");
        $MyData->setAxisName(0, "referenties");
        $MyData->addPoints($names, "Scores");
        $MyData->setSerieDescription("Scores", "Scores");
        $MyData->setAbscissa("Scores");
        //        $MyData -> setAbscissaName("Browsers");
        $MyData->setAxisDisplay(0, AXIS_FORMAT_DEFAULT);

        /* Create the pChart object */
        $myPicture = new pImage(1500, 70, $MyData);
        $myPicture->setFontProperties(array(
            "FontName" => "./pChart/fonts/calibri.ttf",
            "FontSize" => 24,
            "R" => 255,
            "G" => 255,
            "B" => 255,
            "b" => "single"
        ));

        /* Draw the chart scale */
        $myPicture->setGraphArea(750, 0, 1250, 70);
        $AxisBoundaries = array(
            0 => array(
                "Min" => $min_value,
                "Max" => $max_value
            )
        );
        $myPicture->drawScale(array(
            "ManualScale" => $AxisBoundaries,
            "DrawSubTicks" => FALSE,
            "GridR" => 0,
            "GridG" => 0,
            "GridB" => 0,
            "GridAlpha" => 30,
            "Pos" => SCALE_POS_TOPBOTTOM,
            "Mode" => SCALE_MODE_MANUAL
        ));
        //

        $Palette = array("0"=>array("R"=>189,"G"=>224,"B"=>46,"Alpha"=>100),
                 "1"=>array("R"=>225,"G"=>100,"B"=>46,"Alpha"=>100),
                 "2"=>array("R"=>225,"G"=>214,"B"=>46,"Alpha"=>100),
                 "3"=>array("R"=>47,"G"=>151,"B"=>224,"Alpha"=>100));
       /* Draw the chart */
        $myPicture->drawStackedBarChart(array(
            "DisplayValues" => FALSE,
            "Rounded" => FALSE,
            "Surrounding" => 0,
            "Interleave" => 0.3,
//            "OverrideColors"=>$Palette
        ));
        $myPicture->drawText(0, 40,$names[0],array("R"=>0,"G"=>0,"B"=>0,'Align' => TEXT_ALIGN_MIDDLELEFT, "DrawBox" => FALSE));
        $myPicture->drawText(680, 40,$names[1].'%',array("R"=>0,"G"=>0,"B"=>0,'Align' => TEXT_ALIGN_MIDDLELEFT, "DrawBox" => FALSE));
        for ($i=0;$i<count($names);$i++){
            $myPicture->drawText(1330, 10 + ($i)*36,$values[$i],array("R"=>0,"G"=>0,"B"=>0,'Align' => TEXT_ALIGN_TOPRIGHT, "DrawBox" => FALSE));
            $myPicture->drawText(1450, 10 + ($i)*36,$answered[$i],array("R"=>0,"G"=>0,"B"=>0,'Align' => TEXT_ALIGN_TOPRIGHT, "DrawBox" => FALSE));
        }

        $myPicture->render($temp . "percentiles$question_number.png");
        // var_dump($all_questions);
        return $temp . "percentiles$question_number.png";

    }

}
                