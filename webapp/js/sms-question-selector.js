var basetype = "";
var school_id;
var categories = new Array();
var categories_object = new Object();
var category_ids = new Object();

$(document).ready(function() {
    //set all pages to display:none
    $("div[data-role='page']").hide();

    $('#testpagebutton').click(function() {
        load_page('#testpage');
    });
    init_login();
    init_login_temp();
    select_survey_type();

});
function load_page(page) {
    $("div[data-role='page']").hide();
    $(page).fadeIn(500);
}

function init_login_temp() {
    $.ajax({
        type : 'GET',
        url : base_url + 'index.php/xmlprovider/questions/school_id',
        dataType : 'xml',
        success : function(xml) {
            $(xml).find('xml').each(function() {
                school_id = $(this).find('school_id').text();
            });
        }
    });
}

function init_login() {
    //create login function
    $('form#form_login').submit(function(e) {
        e.preventDefault();
        var name = $("#login_name").attr('value');
        var password = $("#login_password").attr('value');
        $.post(base_url + "/index.php/auth/login", {
            login : name,
            password : password
        }, function(data) {
            error = $(data).find(".error");
            //alert(data);
            if (error.length == 0) {
                $('#login').fadeOut(500, function() {
                    $('#typechoice').fadeIn(500);
                });
            } else {
                $("#error").html(error[0].innerHTML + error[1].innerHTML);
            }
        });
        return false;
    });
}

function expand_all() {
    //	$('<button id="expand" />').text('Toon').appendTo('#list_controls').addClass("ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only");
    $('<button id="expand" />').text('Toon').appendTo('#list_controls').button();

    $('#expand').click(function() {
        ($(this).text() === 'Toon' ) ? $(this).text('Verberg') : $(this).text('Toon');
        ($(this).text() === 'Toon' ) ? $('.question_not_selected').addClass('hide') : $('.question_not_selected').removeClass('hide');
    });
}

function select_survey_type() {
    $('#typechoice').fadeIn(500);
    wireTypeChange();
    wireStandardChange();
    wireSavedChange();
    wire_delete_question_button();
    wire_add_question_button();
    get_saved_surveys();
}

function retrieve_questions_per_type(type, survey, standard) {
    var questions = new Array();

    $.ajax({
        type : 'GET',
        url : base_url + '/xmlprovider/questions/all_questions/' + type,
        dataType : 'xml',
        success : function(xml) {
            categories[127] = 'Schoolspecifieke zaken';
            categories_object['127'] = 'Schoolspecifieke zaken';
            //we need an assiocative array because the keys are lost in sort()
            category_ids['Schoolspecifieke zaken'] = 127;
            $(xml).find('item').each(function() {
                var id = $(this).find('question_id').text();
                var li = '<li title="' + $(this).find('category_name').text() + '" class="ui-state-default hide question_not_selected drags ' + $(this).find('question_type_desc_code').text() + '" refid="' + $(this).find('question_id').text() + '" id="' + $(this).find('question_id').text() + '">' + $(this).find('question_description').text() + '</li>';
                $(li).appendTo('#questions_container');

                $(this).find('answers').each(function() {

                    $('<ol class="answer_container tooltip" id="answer_container_' + id + '"></ol>').appendTo('#' + id);

                    $(this).find('answer').each(function() {
                        $('<li class="answer_option">' + $(this).find('description').text() + '</li>').appendTo('#answer_container_' + id);
                    });
                });
                //create array of categories
                categories[$(this).find('category_id').text()] = $(this).find('category_name').text();
                //create object with categories
                categories_object[$(this).find('category_id').text()] = $(this).find('category_name').text();
                //we need an assiocative array because the keys are lost in sort()
                category_ids[$(this).find('category_name').text()] = $(this).find('category_id').text();

            });
            sort_on_category();
            check_mandatory_questions();
            new_question();
            expand_all();
            wire_save_question_list_button();
            wire_print_button();
            if (survey) {
                set_saved_questions(survey);
            }
            if (standard) {
                set_standard_questions(type);
            }

        }
    });
}

function wire_print_button() {
    $('#print_question_list').button();
    $('#print_question_list').show();
    $('#print_question_list').click(function() {
        var string = '<h1>Vragenlijst</h1>';
        var tmp = $('#question_list_container > ul').find('li');
        var i = 1;
        var old_category = '';
        $(tmp).each(function() {
            var category = $(this).parent().children('span').text();
            if (old_category != category){
                string += '<br><b>' + category + '</b><br>';
                old_category = category;
            }
            string += process_print_question($(this), i);
            var refid = $(this).attr('refid');
            var value = $(this).attr('value');
            var answer_string = '';
            if (refid == 'new'){
                var json_text = $(this).children('.new_question_div').text();
                var question_properties = eval( json_text );
                //if satisfaction!!!!
                var answer_type;
                for (var j=0;j<question_properties.length;j++){
                    if (question_properties[j].name == 'answer_type'){
                        answer_type = question_properties[j].value;
                    }
                }
                if (answer_type == 'satisfaction'){
                    answer_string += '<span style="font-size: 8pt">&#9633;&nbsp;Erg ontevreden</span>&nbsp;';
                    answer_string += '<span style="font-size: 8pt">&#9633;&nbsp;Ontevreden</span>&nbsp;';
                    answer_string += '<span style="font-size: 8pt">&#9633;&nbsp;Tevreden</span>&nbsp;';
                    answer_string += '<span style="font-size: 8pt">&#9633;&nbsp;Erg Tevreden</span>&nbsp;';
                    answer_string += '<span style="font-size: 8pt">&#9633;&nbsp;Weet niet/n.v.t.</span>&nbsp;';
                } else {
                    for (var j=0;j<question_properties.length;j++){
                        if (question_properties[j].name.substring(0,23) == 'multiple_choice_answer_'){
                            answer_string += '<span style="font-size: 8pt">&#9633;&nbsp;' + question_properties[j].value + '</span>&nbsp;';
                        };
                        if (question_properties[j].name == 'answer_type'){
                            answer_type = question_properties[j].value;
                        }
                    }
                }
            } else {
                var answers = $('#answer_container_'+refid);
                $('#answer_container_'+refid+' li').each(function() {
                    answer_string += '<span style="font-size: 8pt">&#9633;&nbsp;' + $(this).text() + '</span>&nbsp;';
                });
            } 
            string += answer_string + '<br>';
            i++;
        });

        var print = window.open('', 'Print', 'width=600,height=600');
        var html = '<html><head><title>Printen</title></head><body><div id="print_area">' + string + '</div></body></html>';

        print.document.open();
        print.document.write(html);
        print.print();
        print.document.close();

        return false;

        //$('#print_area').append(string);
        //$('.list_container').toggleClass('hide');
        //$('#print_area').css('display', 'block');
    });
}

jQuery.fn.justtext = function() {

    return $(this).clone()
            .children()
            .remove()
            .end()
            .text();

};


function process_print_question(node, i) {
    var question = node;
    var retrieved_values = 'Vraag ' + i + ' : ' + question.justtext() + '<br />';

    return retrieved_values;
}

function wireTypeChange() {
    $('#select_type').change(function() {
        retrieve_questions_per_type($(this).val());
        basetype = $(this).val();
        $('#survey_type').addClass('hide');
        $('#survey_standard').addClass('hide');
        $('#survey_saved').addClass('hide');
    });
}

function wireStandardChange() {
    $('#select_standard').change(function() {
        retrieve_questions_per_type($(this).val(), null, 1);
        basetype = $(this).val();
        //TODO:: Get standard list
        $('#survey_type').addClass('hide');
        $('#survey_standard').addClass('hide');
        $('#survey_saved').addClass('hide');
    });
}

function wireSavedChange() {
    $('#select_saved').change(function() {
        savedSurvey = get_saved_survey($(this).val());
    });
}

function get_saved_survey(survey_name) {
    $.ajax({
        type : 'GET',
        url : base_url + '/xmlprovider/questions/saved_questionaire/' + survey_name,
        dataType : 'json',
        success : function(survey_json) {
            survey = eval(survey_json);
            basetype = survey[0]['basetype'];
            retrieve_questions_per_type(basetype, survey);
            $('#survey_type').addClass('hide');
            $('#survey_standard').addClass('hide');
            $('#survey_saved').addClass('hide');
        }
    });

};

function set_saved_questions(savedSurvey) {
    $.each(savedSurvey, function(key, value) {
        if (value['id']) {
            var id = value['id'];

            if (isInt(id)) {
                //known question

                var category = $('#' + id).parent().attr('id');

                var listclass = '.sortable_with_' + $('#' + id).parent().attr('id');
                if ($(listclass).html() == '') {
                    $('<span class="category_list_name category_list_name_' + $('#' + id).parent().attr('id') + '">' + $('#' + id).parent().find('.category_name').text() + '</span>').prependTo($(listclass));
                }

                var selector = '.sortable_with_' + category;
                $(selector).removeClass('hide');
                //unhide when hidden

                var text = $("#" + id).clone().children().remove().end().text();
                var qtype = '';
                if ($("#" + id).hasClass('BELANGRIJK')) {
                    qtype += 'BELANGRIJK ';
                }
                if ($("#" + id).hasClass('TEVREDEN')) {
                    qtype += 'TEVREDEN ';
                }
                if ($("#" + id).hasClass('PTP_IMPORTANCE')) {
                    qtype += 'PTP_IMPORTANCE ';
                }
                if ($("#" + id).hasClass('PTP_TEVREDEN')) {
                    qtype += 'PTP_TEVREDEN ';
                }
                var required = '';
                if ((id == 1) || (id == 2) || (id == 68) || (id == 71) || (id == 72) || (id == 129) || (id == 200) || (id == 201) || (id == 306)) {
                    required = 'required';
                }
                var li = $('<li refid="' + id + '" class="question_selected ' + qtype + ' ' + required + '">' + text + '</li>');
                li.appendTo(selector);
                $('#' + id).draggable('option', 'disabled', true);
                check_for_how_important(id);
                process_question_numbering();
                $('#' + id).remove();
            } else if (id == 'new') {
                //self made question
                question_json = value['new_question'];
                question_properties = JSON.parse(question_json);
                // Get the values of the new question fields.
                var category = '';
                var question = '';
                var question_type = '';

                for (var i=0;i<question_properties.length;i++){
                    if (question_properties[i].name == 'new_question_category'){
                        category_id=question_properties[i].value;
                        category = categories_object[category_id];
                    };
                    if (question_properties[i].name == 'new_question_text'){
                        question=question_properties[i].value;
                    };
                    if (question_properties[i].name == 'answer_type'){
                        question_type=question_properties[i].value;
                    };
                    
                }
                var classname = category.replace(/ /g, "_").replace(/,/g, "_").replace(/&/g, "_").replace(/'/g, "_").replace(/\//g, "_");
                // Create the selector so we know where we have to append to.
                var parent_selector = '.sortable_with_list' + classname;
                var selector = '.category_list_name_list' + classname;


                if ($(selector).length !== 0) {
                    // The category already exists in the list so we can append our LI element directly.
                    $(parent_selector).removeClass('hide');
                    //unhide when hidden
                } else if (($(parent_selector).length !== 0 ) && ($(selector).length === 0 )) {
                    // The UL element for the category exists, but there is no category text so we need to append that aswel as our LI element.
                    $('<span class="category_list_name category_list_name_list' + classname + '">' + category + '</span>').removeClass('hide');
                    //unhide when hidden
                    $('<span class="category_list_name category_list_name_list' + classname + '">' + category + '</span>').appendTo(parent_selector);
                } else {
                    // There is no UL and no category so we need to add append everything.
                    var ul = $('<ul class="sortable_with_list' + classname + ' sorts ui-sortable" />');
                    ul.appendTo($('#question_list_container'));
                    $('<span class="category_list_name category_list_name_list' + classname + '">' + category + '</span>').appendTo(ul);
                }
                var li = $('<li refid="new" class="question_selected">' + question + '<span class="editnew" title="edit"> </span></li>');
                li.appendTo(parent_selector);
                var string = question_json;
                var div = $('<div class="new_question_div hide">' + string + '</div>');
                div.appendTo(li);
                // We need to call the sort function here because our dynamically added question wasn't available in the original create sorts process.
                create_sorts(ul);

                process_question_numbering();

            }

        }
    });
    wire_edit_questions();
}

function set_standard_questions(standard) {
    if (standard == 'otp') {
        standard = 'OTP_2004';
    }
    if (standard == 'ltp') {
        standard = 'LTP0908';
    }
    if (standard == 'ptp') {
        standard = 'PTP_2003';
    }
    $.ajax({
        type : 'GET',
        url : base_url + '/xmlprovider/questions/template/' + standard + '/',
        dataType : 'xml',
        success : function(questions) {
            $(questions).find('item').each(function() {
                var id = $(this).text();
                //				$()

                var category = $('#' + id).parent().attr('id');

                var listclass = '.sortable_with_' + $('#' + id).parent().attr('id');
                if ($(listclass).html() == '') {
                    $('<span class="category_list_name category_list_name_' + $('#' + id).parent().attr('id') + '">' + $('#' + id).parent().find('.category_name').text() + '</span>').prependTo($(listclass));
                }

                var selector = '.sortable_with_' + category;
                $(selector).removeClass('hide');
                //unhide when hidden

                var text = $("#" + id).clone().children().remove().end().text();
                var qtype = '';
                if ($("#" + id).hasClass('BELANGRIJK')) {
                    qtype += 'BELANGRIJK ';
                }
                if ($("#" + id).hasClass('TEVREDEN')) {
                    qtype += 'TEVREDEN ';
                }
                if ($("#" + id).hasClass('PTP_IMPORTANCE')) {
                    qtype += 'PTP_IMPORTANCE ';
                }
                if ($("#" + id).hasClass('PTP_TEVREDEN')) {
                    qtype += 'PTP_TEVREDEN ';
                }
                var required = '';
                if ((id == 1) || (id == 2) || (id == 68) || (id == 71) || (id == 72) || (id == 129) || (id == 200) || (id == 201) || (id == 306)) {
                    required = 'required';
                }
                var li = $('<li refid="' + id + '" class="question_selected ' + qtype + ' ' + required + '">' + text + '</li>');
                li.appendTo(selector);
                $('#' + id).draggable('option', 'disabled', true);
                check_for_how_important(id);
                process_question_numbering();
                //				$('#' + id).remove();
            });
        }
    });

    /*	$.each(savedSurvey, function(key,value) {
     if (value['id']){
     var id = value['id'];

     var category = $('#'+id).parent().attr('id');

     var listclass = '.sortable_with_' + $('#'+id).parent().attr('id');
     if ($(listclass).html() == ''){
     $('<span class="category_list_name category_list_name_' + $('#'+id).parent().attr('id') + '">' + $('#'+id).parent().find('.category_name').text() + '</span>').prependTo($(listclass));
     }

     var selector = '.sortable_with_' + category;
     $(selector).removeClass('hide');
     //unhide when hidden

     var text = $("#" + id).clone().children().remove().end().text();
     var qtype = '';
     if ($("#" + id).hasClass('BELANGRIJK')) {
     qtype += 'BELANGRIJK ';
     }
     if ($("#" + id).hasClass('TEVREDEN')) {
     qtype += 'TEVREDEN ';
     }
     if ($("#" + id).hasClass('PTP_IMPORTANCE')) {
     qtype += 'PTP_IMPORTANCE ';
     }
     if ($("#" + id).hasClass('PTP_TEVREDEN')) {
     qtype += 'PTP_TEVREDEN ';
     }
     var li = $('<li refid="' + id + '" class="question_selected ' + qtype + '">' + text + '</li>');
     li.appendTo(selector);
     $('#' + id).draggable('option', 'disabled', true);
     check_for_how_important(id);
     process_question_numbering();
     $('#'+id).remove();
     }
     }); */
}

function get_saved_surveys() {
    $.ajax({
        type : 'GET',
        url : base_url + '/xmlprovider/questions/saved_questionaires/',
        dataType : 'json',
        success : function(survey_json) {
            $.each(survey_json, function(key, value) {
                $('#select_saved').append($("<option></option>").attr("value", value).text(value));
            });
        }
    });

};

function create_drags(drag_selector, sortable_with) {

    $(drag_selector).draggable({
        connectToSortable : sortable_with,
        helper : 'clone',
        revert : 'invalid',
        distance : 30,
        cursorAt : {
            'right' : 0
        }
    });

    wire_answer_mouseover();
}

function create_sorts(ul) {

    var el = (ul ) ? ul : '.sorts';

    $(el).sortable({
        items : "li:not(.category_list_name, .info)",
        forcePlaceholderSize : true,
        dropOnEmpty : true,
        tolerance : 'pointer',
        update : function(event, ui) {

            // Check if we dropped on a sortable
            if ($(this).hasClass('sorts') === true) {
                ui.item.removeClass('question_not_selected');
                ui.item.addClass('question_selected');
                //$( '<submit class="delete_button" />' ).prependTo( ui.item );
            } else {
                ui.item.addClass('question_not_selected');
                ui.item.removeClass('question_selected');
            }

            $('#' + ui.item.attr('refid')).draggable('option', 'disabled', true);
            $('#' + ui.item.attr('refid')).addClass('hide_hard');
            var id = ui.item.attr('refid');
            check_for_how_important(id);
            process_question_numbering();
            //wire_delete_question_button()
        },
        stop : function(event, ui) {
            $(this).removeClass('target');
            var list = $('#question_list_container li.ui-state-default');
            if (list.length >= 1) {
                $('#select_info').remove();
                $('#clear_questions').toggleClass('hide');
            } else {
                if ($('#select_info').length === 0) {
                    //dragging is not preferred way $('<li id="select_info" class="info error">Sleep hier uw vragen heen</li>').appendTo('#question_list_container');
                }
                $('#clear_questions').toggleClass('hide');
            }
        },
        over : function(event, ui) {
            $(this).addClass('target');
        },
        activate : function(event, ui) {
            $(this).addClass('target');
        },
        out : function(event, ui) {
            $(this).removeClass('target');
        },
        deactivate : function(event, ui) {
            $(this).removeClass('target');
        }
    });
    //.disableSelection();

}

function filter_questions() {
    $('#filter_field').keyup(function() {
        var re = $('#filter_field').val();

        $('.question_not_selected').each(function() {

            var str = $(this).text();
            var match = str.search(re);

            if (match == -1) {
                $(this).addClass('hide');
            } else {
                $(this).removeClass('hide');
            }
        });
    });
}

function sort_on_category() {
    var groups = [];

    $('#questions_container > li').each(function() {
        var li = $(this);
        var title = $(this).attr('title');
        var classname = title.replace(/ /g, "_").replace(/,/g, "_").replace(/&/g, "_").replace(/'/g, "_").replace(/\//g, "_");
        var li_group = 'list' + $(this).attr('title');

        if (!groups[li_group]) {
            groups[li_group] = [];
            var first_li = $('<li title="' + title + '" class="category_name" />').text(title);
            groups[li_group].push(first_li);
        }

        groups[li_group].push(li);
    });
    for (group in groups ) {
        var groupname = group.replace(/ /g, "_");
        groupname = groupname.replace(/,/g, "_");
        groupname = groupname.replace(/\//g, "_");
        groupname = groupname.replace(/&/g, "_");
        groupname = groupname.replace(/'/g, "_");
        groupname = groupname.replace(/\//g, "_");
        var sortable_with = '.sortable_with_' + groupname;
        var ul = $('<ul class="sortable_with_' + groupname + ' sorts" />');
        ul.appendTo('#question_list_container');
    }

    create_sorts();

    for (group in groups ) {
        var groupname = group.replace(/ /g, "_");
        groupname = groupname.replace(/,/g, "_");
        groupname = groupname.replace(/\//g, "_");
        groupname = groupname.replace(/&/g, "_");
        groupname = groupname.replace(/'/g, "_");
        groupname = groupname.replace(/\//g, "_");
        var ul = $('<ul class="drag_container_' + groupname + '" />').attr('id', groupname);
        var lis = groups[group];

        for ( i = 0; i < lis.length; i++) {
            ul.append(lis[i]);
        }
        ul.appendTo('#questions_container');
        var sortable_with = '.sortable_with_' + groupname;
        var drag_selector = '.drag_container_' + groupname + '> li:not(.category_name)';

        create_drags(drag_selector, sortable_with);
    }

    create_clicks();
    filter_questions();
}

function create_clicks() {
    $('.category_name').click(function() {
        $(this).parent().children('.ui-state-default').toggleClass('hide');

        //		$('.question_not_selected').addClass('hide');
        //check each category on the right wether to show or not
        $.each(categories, function(key, category) {
            if (category) {
                var classname = category.replace(/ /g, "_").replace(/,/g, "_").replace(/&/g, "_").replace(/'/g, "_").replace(/\//g, "_");
                var listclass_right = '.sortable_with_list' + classname;
                var number_of_questions_right = $(listclass_right).children('li').length;
                var listclass_left = '#list' + classname;
                var number_of_questions_left = $(listclass_left).children(':not(.hide) + li + .ui-state-default').length;
                var listclass = '.sortable_with_list' + classname;
                var check_category = '.category_list_name_list' + classname;
                if ((number_of_questions_right == 0) && (number_of_questions_left <= 1)) {
                    $(listclass).hide();
                } else {
                    //we open it, so the category should be visible on the other side
                    if ($(check_category).length === 0) {
                        $('<span class="category_list_name category_list_name_list' + classname + '">' + category + '</span>').prependTo($(listclass));
                    }
                    $(listclass).show();
                    $(check_category).show();
                }

            }
        });

    });
}

function new_question() {
    var options;

    categories.sort();
    $.each(categories, function(key, category) {
        if (category != undefined) {
            options += '<option value="' + category_ids[category] + '" id="' + category_ids[category] + '">' + category + '</option>';
        }
    });

    $('<button id="new_question" />').text('Nieuwe vraag').appendTo('#questionnaire_controls').button().click(function() {
        $('<form id="new_question_form"><div class="block"><label for="new_question_category">Kies een categorie:</label><select name="new_question_category" id="new_question_category" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">' + options + '</select></div><div class="block"><label for="new_question_text">Nieuwe vraag:</label><input name="new_question_text" id="new_question_text" type="text" maxlength="255" /></div>'+
          '<div class="block"><label for="answer_type">Kies een antwoordtype:</label>'+
            '<select name="answer_type" id="answer_type" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'+
              '<option value="open vraag" selected="selected" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">Open vraag</option>'+
              '<option value="satisfaction">Tevredenheid </option>'+
              '<option value="multiple choice">Multiple Choice</option>'+
            '</select>'+
          '</div>'+
          '<div class="block" id="block_answer_required"><label for="answer_type">Is de vraag verplicht?:</label><select name="answer_required" id="answer_required" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><option value="1" selected="selected">Ja</option><option value="0">Nee</option></select></div>'+
          '<div class="block" id="block_answer_multiple"><label for="answer_multiple">Zijn meerdere antwoorden mogelijk?:</label><select name="answer_multiple" id="answer_multiple" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><option value="1">Ja</option><option value="0" selected="selected">Nee</option></select></div><div id="answer_container"></div><div id="answeraddcontainer"></div><div class="block"><input id="add_new_question" type="submit" value="Opslaan" class="text ui-widget-content ui-corner-all" /><input id="clear_new_question" type="submit" value="Annuleren" class="text ui-widget-content ui-corner-all" /></div></form>').modal({
            position : ["50px", "250px"]
        });
        $('.simplemodal-wrap').css('overflow','auto');
        wire_add_question();
        wire_clear_question();
        wire_question_type();
    });
}

function wire_add_question() {
    $('#add_new_question').click(function(event) {
        event.preventDefault();
        // Get the values of the new question fields.
        var category = $('#new_question_category option:selected').text();
        var classname = category.replace(/ /g, "_").replace(/,/g, "_").replace(/&/g, "_").replace(/'/g, "_").replace(/\//g, "_");
        var question = $('#new_question_text').val();
        var question_type = $('#answer_type').val();
        
        //check if in edit mode
        var question_number = $('#question_number').val();
        if (question_number){
            //delete old question
            $('LI[value="'+question_number+'"]').remove();
        }

        // Create the selector so we know where we have to append to.
        var parent_selector = '.sortable_with_list' + classname;
        var selector = '.category_list_name_list' + classname;
        var form_node = $('#new_question_form');

        var li = $('<li refid="new" class="question_selected">' + question + '<span class="editnew" title="bewerk deze vraag"> </span></li>');
        if (question_number) {
            // The category already exists in the list so we can append our LI element directly.
            $(parent_selector).removeClass('hide');
            //unhide when hidden
            if ($('li[value="'+(parseInt(question_number-1))+'"]').parent().hasClass('sortable_with_list' + classname)){
                li.insertAfter('li[value="'+(question_number-1)+'"]');
            } else if ($('li[value="'+(parseInt(question_number)+1)+'"]').parent().hasClass('sortable_with_list' + classname)){
                li.insertBefore('li[value="'+(parseInt(question_number)+1)+'"]');
            } else {
                li.appendTo(parent_selector);
            }
            var string = JSON.stringify(form_node.serializeArray());
            var div = $('<div class="new_question_div hide">' + string + '</div>');
            div.appendTo(li);
        } else if ($(selector).length !== 0) {
            // The category already exists in the list so we can append our LI element directly.
            $(parent_selector).removeClass('hide');
            //unhide when hidden
            li.appendTo(parent_selector);
            var string = JSON.stringify(form_node.serializeArray());
            var div = $('<div class="new_question_div hide">' + string + '</div>');
            div.appendTo(li);

        } else if (($(parent_selector).length !== 0 ) && ($(selector).length === 0 )) {
            // The UL element for the category exists, but there is no category text so we need to append that aswel as our LI element.
            $('<span class="category_list_name category_list_name_list' + classname + '">' + category + '</span>').removeClass('hide');
            //unhide when hidden
            $('<span class="category_list_name category_list_name_list' + classname + '">' + category + '</span>').appendTo(parent_selector);
            li.appendTo(parent_selector);
            var string = JSON.stringify(form_node.serializeArray());
            var div = $('<div class="new_question_div hide">' + string + '</div>');
            div.appendTo(li);
        } else {
            // There is no UL and no category so we need to add append everything.
            var ul = $('<ul class="sortable_with_list' + classname + ' sorts ui-sortable" />');
            ul.appendTo($('#question_list_container'));
            $('<span class="category_list_name category_list_name_list' + classname + '">' + category + '</span>').appendTo(ul);
            li.appendTo(ul);
            var string = JSON.stringify(form_node.serializeArray());
            var div = $('<div class="new_question_div hide">' + string + '</div>');
            div.appendTo(li);

            // We need to call the sort function here because our dynamically added question wasn't available in the original create sorts process.
            create_sorts(ul);
        }
        wire_edit_questions();
        process_question_numbering();
        // Close the overlay and prevent the button from submitting the form.
        $.modal.close();
    });
}


function editnew() {
//        var string = $(this).parent().find('div').html();
        var question_json = $(this).parent().find('div').html();
        var question_number = $(this).parent().val();
        var question_properties = JSON.parse(question_json);
        // Get the values of the new question fields.
        var question_category = '';
        var question = '';
        var question_type = '';
        var question_required = '';
        var question_multiple = '';
        var question_answers = Array();

        for (var i=0;i<question_properties.length;i++){
            if (question_properties[i].name == 'new_question_category'){
                category_id=question_properties[i].value;
                question_category = categories_object[category_id];
            };
            if (question_properties[i].name == 'new_question_text'){
                question=question_properties[i].value;
            };
            if (question_properties[i].name == 'answer_type'){
                question_type=question_properties[i].value;
            };
            if (question_properties[i].name == 'answer_required'){
                question_required=question_properties[i].value;
            };
            if (question_properties[i].name == 'answer_multiple'){
                question_multiple=question_properties[i].value;
            };
            if (question_properties[i].name.substring(0,23) == 'multiple_choice_answer_'){
                question_answers.push(question_properties[i].value);
//                alert(question_properties[i].value);
            };
                    
        }
        var options;
    
        categories.sort();
        $.each(categories, function(key, category) {
            if (category != undefined) {
                if (question_category === category){
                    options += '<option value="' + category_ids[category] + '" id="' + category_ids[category] + '"  selected="selected" >' + category + '</option>';
                } else {
                    options += '<option value="' + category_ids[category] + '" id="' + category_ids[category] + '">' + category + '</option>';
                }
            }
        });
        
        var answer_type_options;
        if (question_type === 'open vraag'){
            answer_type_options = '<option value="open vraag" selected="selected" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">Open vraag</option>';
            answer_type_options +=  '<option value="satisfaction">Tevredenheid</option>';
            answer_type_options +=  '<option value="multiple choice">Multiple Choice</option>';
        } else if (question_type === 'multiple choice'){
            answer_type_options = '<option value="open vraag" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">Open vraag</option>';
            answer_type_options +=  '<option value="satisfaction">Tevredenheid</option>';
            answer_type_options +=  '<option value="multiple choice" selected="selected" >Multiple Choice</option>';
        } else if (question_type === 'satisfaction'){
            answer_type_options = '<option value="open vraag" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">Open vraag</option>';
            answer_type_options +=  '<option value="satisfaction" selected="selected">Tevredenheid</option>';
            answer_type_options +=  '<option value="multiple choice">Multiple Choice</option>';
        }
                
        var anwer_required_options;
        if (question_required == 1){
            answer_required_options = '<option value="1" selected="selected">Ja</option><option value="0">Nee</option>';
        } else {
            answer_required_options = '<option value="1">Ja</option><option value="0" selected="selected">Nee</option>';
        }

        var anwer_multiple_options;
        if (question_multiple == 1){
            anwer_multiple_options = '<option value="1" selected="selected">Ja</option><option value="0">Nee</option>';
        } else {
            anwer_multiple_options = '<option value="1">Ja</option><option value="0" selected="selected">Nee</option>';
        }
        
        var answers = '';
        var option_count = 0;
        $.each(question_answers, function(key, question) {
            if (question !== ''){
                option_count++;
                answers += '<div class="block"><label for="">Optie '+option_count+'</label><input class="multiple_choice_answer" type="text" name="multiple_choice_answer_'+option_count+'" maxlength="30" value="'+question+'" /></div>';
            }
        });

        var editform = '<form id="new_question_form"><input type="hidden" name="question_number" id="question_number" value="'+question_number+'"><div class="block">';
        editform += '<div class="block"><label for="new_question_category">Kies een categorie:</label><select name="new_question_category" id="new_question_category" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">' + options + '</select></div>';
        editform += '<div class="block"><label for="new_question_text">Nieuwe vraag:</label><input name="new_question_text" id="new_question_text" type="text" maxlength="255" value="'+question+'" /></div>';
        editform += '<div class="block"><label for="answer_type">Kies een antwoordtype:</label><select name="answer_type" id="answer_type" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'+ answer_type_options +'</select></div>';
        editform += '<div class="block"><label for="answer_required">Is de vraag verplicht?:</label><select name="answer_required" id="answer_required" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'+ answer_required_options + '</select></div>';
        editform += '<div class="block"><label for="answer_multiple">Zijn meerdere antwoorden mogelijk?:</label><select name="answer_multiple" id="answer_multiple" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'+ anwer_multiple_options + '</select></div>';
        editform += '<div id="answer_container">' + answers + '</div><div id="answeraddcontainer"></div><div class="block"><input id="add_new_question" type="submit" value="Opslaan" class="text ui-widget-content ui-corner-all" /><input id="clear_new_question" type="submit" value="Annuleren" class="text ui-widget-content ui-corner-all" /></div></form>';
        $(editform).modal({
            position : ["50px", "250px"]
        });
        $('<button id="add_multiple_choice_answer" class="text ui-widget-content ui-corner-all">Voeg antwoord toe</button>').appendTo('#answeraddcontainer');
        $('<p class="info">  * Als laatste vraag wordt automatisch de optie "Weet niet/n.v.t." toegevoegd</p>').appendTo('#answeraddcontainer');
        $('<p class="info">  * Voeg (indien mogelijk) het meest negatieve antwoord als eerste toe</p>').appendTo('#answeraddcontainer');

        $("#add_multiple_choice_answer").click(function(e) {
            var id = $('.multiple_choice_answer').length;
            id++;
            $('<div class="block"><label for="multiple_choice_answer_' + id + '">Optie ' + id + '</label><input class="multiple_choice_answer" type="text" name="multiple_choice_answer_' + id + '" maxlength="30" />').appendTo('#answer_container');
            e.preventDefault();
        });

        wire_add_question();
        wire_clear_question();
        wire_question_type();
};
    
function wire_edit_questions() {
    $('.editnew').off("click", editnew);
    $('.editnew').on("click", editnew);
}


function wire_question_type() {
    // Listen for the a change in the question type selector. If changed we need to update the possible answer fields.
    $('#answer_type').change(function() {
        $('#answeraddcontainer').empty();
        if ($('#answer_type option:selected').val() === 'multiple choice') {
            $('#block_answer_required').show();
            $('#block_answer_multiple').show();
            $('#answer_container').show();
            if ($('#answer_container').children().length == 0){
                $('<div class="block"><label for="">Optie 1</label><input class="multiple_choice_answer" type="text" name="multiple_choice_answer_1" maxlength="30" /></div>').appendTo('#answer_container');
            }
            $('<button id="add_multiple_choice_answer" class="text ui-widget-content ui-corner-all">Voeg antwoord toe</button>').appendTo('#answeraddcontainer');
            $('<p class="info">  * Als laatste vraag wordt automatisch de optie "Weet niet/n.v.t." toegevoegd</p>').appendTo('#answeraddcontainer');
            $('<p class="info">  * Voeg (indien mogelijk) het meest negatieve antwoord als eerste toe</p>').appendTo('#answeraddcontainer');
        }

        if ($('#answer_type option:selected').val() === 'satisfaction') {
            $('#block_answer_required').hide();
            $('#block_answer_multiple').hide();
            $('#answer_container').hide();
            if (basetype == 'ltp'){
                $('<p class="info">Antwoorden: Niet zo - Gaat wel - Leuk</p>').appendTo('#answeraddcontainer');
            } else {
                $('<p class="info">Antwoorden: Erg ontevreden - Ontevreden - Tevreden - Erg tevreden - Weet niet/n.v.t</p>').appendTo('#answeraddcontainer');
            }
            
            $('<p class="info"> * Deze vraag wordt meegenomen in de tevredenheidsstatistieken</p>').appendTo('#answeraddcontainer');
        }

        if ($('#answer_type option:selected').val() === 'open vraag') {
            $('#block_answer_required').show();
            $('#block_answer_multiple').hide();
            $('#answer_container').hide();
        }

        $("#add_multiple_choice_answer").click(function(e) {
            var id = $('.multiple_choice_answer').length;
            id++;
            $('<div class="block"><label for="multiple_choice_answer_' + id + '">Optie ' + id + '</label><input class="multiple_choice_answer" type="text" name="multiple_choice_answer_' + id + '" maxlength="30" />').appendTo('#answer_container');
            e.preventDefault();
        });

    });
}

function wire_clear_question() {
    // This function deletes the modal container and overlay form the DOM.
    $('#clear_new_question').click(function(e) {
        $.modal.close();
        e.preventDefault();
    });
}

function wire_save_question_list_button_old() {
    // This function parses the selected question list, converts the parsed object to JSON and sends it to the server.
    $('#save_question_list').button().click(function() {
        var json_string = new Array();
        json_string.push('{"basetype":"' + basetype + '"}');
        $('#question_list_container > ul').find('li').each(function() {
            var question_json = process_question($(this));
            if (question_json !== ''){
                json_string.push();
            }
        });
        $.ajax({
            type : 'POST',
            url : base_url + '/xmlprovider/questions/save_questionaire',
            dataType : 'json',
            data : {
                data : '[' + json_string.join(',') + ']'
            },
            success : function(data) {
                $(data).each(function() {
                    console.log(this);
                });
                console.log(data.responseText);
                smsrespons = data.responseText.split(';');
                muiscode = smsrespons[0];
                alert('De peiling is succesvol opgeslagen onder nummer: ' + muiscode.replace('MUIS_', ''));
                //                window.open('http://www.scholenmetsucces.nl/vragenplanner/deelnameformulier?AVL='+smsrespons[0],'_top');
            },
            error : function(data) {
                $(data).each(function() {
                    console.log(this);
                });
                console.log(data.responseText);
                alert('Er is iets fout gegaan in de aanmaak van de peiling' + data.responseText);
            }
        });

        //        console.log(JSON.stringify(json_string));
    });
}

function process_question(node) {
    var question = node;
    var retrieved_values = {
        "id" : question.attr('refid'),
        "question_text" : question.text()
    };

    node.find('> .new_question_div').each(function() {
        retrieved_values.new_question = $(this).text();
    });
    if ($(this).text() !== ''){
        return '';    
    } else {
        return JSON.stringify(retrieved_values);
    }
}

function wire_answer_mouseover() {
    $('.drags').each(function() {

        var text = $(this).find('.answer_container').html();

        $(this).simpletip({
            content : text,
            position : 'right',
            offset : [0, 0],
            activeClass : 'active_tooltip',
            persistent : true
        });
    });
}

function check_mandatory_questions() {
    var type = $('#select_type').val();

    if (type === 'otp') {
        // Create mandatory question for OTP list
        var listclass = '.sortable_with_' + $('#1').parent().attr('id');
        $('<span class="category_list_name category_list_name_' + $('#1').parent().attr('id') + '">' + $('#1').parent().find('.category_name').text() + '</span>').prependTo($(listclass));
        var text = $('<li refid="1" class="question_selected required" class="question_selected">Ik vul deze lijst in voor mijn kind in groep...</li>' + '<li refid="2" class="question_selected required">Is het kind waarvoor u deze lijst invult een jongen of een meisje?</li>');
        text.appendTo(listclass);
        var listclass = '.sortable_with_' + $('#68').parent().attr('id');
        $('<span class="category_list_name category_list_name_' + $('#68').parent().attr('id') + '">' + $('#68').parent().find('.category_name').text() + '</span>').prependTo($(listclass));
        var text = $('<li refid="68" class="question_selected required">Welk rapport cijfer geeft u aan de school</li>');
        text.appendTo(listclass);

        var listclass = '.sortable_with_' + $('#10872').parent().attr('id');
        $('<span class="category_list_name category_list_name_' + $('#10872').parent().attr('id') + '">' + $('#10872').parent().find('.category_name').text() + '</span>').prependTo($(listclass));
        var text = $('<li refid="10872" class="question_selected required">Indien u nog opmerkingen of andere sugeesties heeft over de vragenlijst, kunt u die hier plaatsen</li>');
        text.appendTo(listclass);

        $('#1').draggable('option', 'disabled', true);
        $('#2').draggable('option', 'disabled', true);
        $('#68').draggable('option', 'disabled', true);
        $('#10872').draggable('option', 'disabled', true);
        process_question_numbering();

    } else if (type === 'ltp') {
        // Create mandatory question for LTP list
        var listclass = '.sortable_with_' + $('#71').parent().attr('id');
        $('<span class="category_list_name category_list_name_' + $('#71').parent().attr('id') + '">' + $('#71').parent().find('.category_name').text() + '</span>').prependTo($(listclass));
        var text = $('<li refid="71" class="question_selected required">Ben je een jongen of een meisje?</li><li refid="72" class="question_selected required">In welke groep zit je?</li>');
        text.appendTo(listclass);
        var listclass = '.sortable_with_' + $('#129').parent().attr('id');
        $('<span class="category_list_name category_list_name_' + $('#129').parent().attr('id') + '">' + $('#129').parent().find('.category_name').text() + '</span>').prependTo($(listclass));
        var text = $('<li refid="129" class="question_selected required">Welk rapportcijfer zou je deze school geven?</li>');
        text.appendTo(listclass);
        $('#71').draggable('option', 'disabled', true);
        $('#72').draggable('option', 'disabled', true);
        $('#129').draggable('option', 'disabled', true);
        process_question_numbering();

    } else if (type === 'ptp') {
        // Create mandatory question for PTP list
        var listclass = '.sortable_with_' + $('#200').parent().attr('id');
        $('<span class="category_list_name category_list_name_' + $('#200').parent().attr('id') + '">' + $('#200').parent().find('.category_name').text() + '</span>').prependTo($(listclass));
        var text = $('<li refid="200" class="question_selected required">Wat is uw geslacht?</li><li refid="201" class="question_selected required">Wat is uw leeftijd?</li>');
        text.appendTo(listclass);
        var listclass = '.sortable_with_' + $('#306').parent().attr('id');
        $('<span class="category_list_name category_list_name_' + $('#306').parent().attr('id') + '">' + $('#306').parent().find('.category_name').text() + '</span>').prependTo($(listclass));
        var text = $('<li refid="306" class="question_selected required">Welk rapport cijfer geeft u aan uw school</li>');
        text.appendTo(listclass);
        var listclass = '.sortable_with_' + $('#13509').parent().attr('id');
        $('<span class="category_list_name category_list_name_' + $('#13509').parent().attr('id') + '">' + $('#13509').parent().find('.category_name').text() + '</span>').prependTo($(listclass));
        var text = $('<li refid="13509" class="question_selected required">Indien u nog opmerkingen of andere sugeesties heeft over de vragenlijst, kunt u die hier plaatsen</li>');
        text.appendTo(listclass);
        $('#200').draggable('option', 'disabled', true);
        $('#201').draggable('option', 'disabled', true);
        $('#306').draggable('option', 'disabled', true);
        $('#13509').draggable('option', 'disabled', true);
        process_question_numbering();
    }
    $(".errorhead").html('* Deze vragen zijn verplicht').fadeOut(5000);
    //    select_all();
}

function check_for_how_important(id) {

    //var how_important = $('#' + id).parent().children(':contains("Hoe belangrijk")');
    var how_important = $('#' + id).parent().children('.BELANGRIJK:first, .PTP_IMPORTANCE:first');

    var how_important_class = $(how_important).parent().attr('id');
    var how_important_id = $(how_important).attr('id');
    var how_important_text = $(how_important).clone().children().remove().end().text();
    var number_of_satisfied = $('.sortable_with_' + how_important_class + '> li.TEVREDEN, .sortable_with_' + how_important_class + '> li.PTP_TEVREDEN').length;

    if (number_of_satisfied > 0) {
        if (number_of_satisfied >= 3) {
            $('#notion_' + how_important_class).remove();
            //make sure, belangrijk question is always last
            $('.sorts > li[refid="' + how_important_id + '"]').remove();
            //        if($('.sorts > li[refid="' + how_important_id + '"]').length === 0) {
            $('<li class="required" refid="' + how_important_id + '">' + how_important_text + '</li>').appendTo('.sortable_with_' + how_important_class);
            $(how_important).draggable('option', 'disabled', true);
            $(".errorhead").show().html('* Deze vraag is verplicht').fadeOut(5000);
            //        }
        } else {
            $('li[refid="' + how_important_id + '"]').removeClass('required');
            $('#notion_' + how_important_class).remove();
            $('<li class="info" id="notion_' + how_important_class + '">Deze rubriek wordt niet meegenomen in de rubrieksstatistieken tot dat er minstens 3 vragen zijn toegevoegd</li>').appendTo('.sortable_with_' + how_important_class);
            $('#notion_' + how_important_class).draggable('option', 'disabled', true);
        }
    } else {
        $('#notion_' + how_important_class).remove();
    }
}

function process_question_numbering() {
    $('#question_list_container li:not(.answer_option, .info)').each(function(i) {
        i++;
        $(this).attr('value', i);
    });
}

function wire_delete_question_button() {
    $('#question_list_container').delegate('li:not(".answer_option, .info, .required")', 'hover', function() {
        $('.delete_button').remove();
        var id = $(this).attr('refid');
        var sequence_no = $(this).attr('value');
        var this_delete = $('<input refid="' + id + '" sequence_no="' + sequence_no + '" type="submit" class="delete_button" value="" title="verwijder deze vraag" />');
        this_delete.insertAfter(this);
        var parent = $('li[refid="' + id + '"][value="' + sequence_no + '"]:not("#' + id + '")').parent().addClass('hide_' + id);

        $(this_delete).click(function() {
            var id = $(this).attr('refid');
            var sequence_no = $(this).attr('sequence_no');
            var parent = $('.hide_' + id);

            $('li[refid="' + id + '"][value="' + sequence_no + '"]:not("#' + id + '")').remove();
            $(this).remove();
            $('#' + id).draggable('option', 'disabled', false);

            check_for_how_important(id);
            process_question_numbering();

            if ($(parent).children('li:not(".info")').length === 0) {
                $(parent).removeClass('hide_' + id);
                $(parent).addClass('hide');
            }
        });
    });
}

function wire_add_question_button() {
    $('#questions_container').delegate('li:not(".category_name, .ui-state-disabled, .answer_option")', 'hover', function() {
        $('.add_button').remove();
        var id = $(this).attr('refid');
        var this_add = $('<input refid="' + id + '" type="submit" class="add_button" value="" />');
        this_add.insertAfter(this);

        $(this_add).click(function() {
            var category = $(this).parent().attr('id');
            var id = $(this).attr('refid');
            var selector = '.sortable_with_' + category;
            $(selector).removeClass('hide');
            //unhide when hidden

            var text = $("#" + id).clone().children().remove().end().text();
            var qtype = '';
            if ($("#" + id).hasClass('BELANGRIJK')) {
                qtype += 'BELANGRIJK ';
            }
            if ($("#" + id).hasClass('TEVREDEN')) {
                qtype += 'TEVREDEN ';
            }
            if ($("#" + id).hasClass('PTP_IMPORTANCE')) {
                qtype += 'PTP_IMPORTANCE ';
            }
            if ($("#" + id).hasClass('PTP_TEVREDEN')) {
                qtype += 'PTP_TEVREDEN ';
            }
            var li = $('<li refid="' + id + '" class="question_selected ' + qtype + '">' + text + '</li>');
            li.appendTo(selector);
            $('#' + id).draggable('option', 'disabled', true);
            check_for_how_important(id);
            process_question_numbering();
            $(this).remove();
        });
    })
}

function select_all() {
    alert('selectall');
    $('.question_not_selected').each(function() {
        var category = $(this).parent().attr('id');
        var id = $(this).attr('refid');
        var selector = '.sortable_with_' + category;
        var text = $("#" + id).clone().children().remove().end().text();
        var qtype = '';
        if ($("#" + id).hasClass('BELANGRIJK')) {
            qtype += 'BELANGRIJK ';
        }
        if ($("#" + id).hasClass('TEVREDEN')) {
            qtype += 'TEVREDEN ';
        }
        if ($("#" + id).hasClass('PTP_IMPORTANCE')) {
            qtype += 'PTP_IMPORTANCE ';
        }
        if ($("#" + id).hasClass('PTP_TEVREDEN')) {
            qtype += 'PTP_TEVREDEN ';
        }
        var li = $('<li refid="' + id + '" class="question_selected ' + qtype + '">' + text + '</li>');
        li.appendTo(selector);
        $('#' + id).draggable('option', 'disabled', true);
        check_for_how_important(id);
        process_question_numbering();
        $(this).remove();
    })
}

function wire_save_question_list_button() {
    $('#save_question_list').button().show();
    var name = $("#name")
    allFields = $([]).add(name), tips = $(".validateTips");

    function checkLength(o, n, min, max) {
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            updateTips("De lengte van de naam " + n + " moet tussen " + min + " en " + max + " zijn.");
            return false;
        } else {
            return true;
        }
    }

    function updateTips(t) {
        tips.text(t).addClass("ui-state-highlight");
        setTimeout(function() {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }


    $("#save_questionaire").dialog({
        autoOpen : false,
        height : 150,
        width : 350,
        modal : true,
        buttons : {
            "Save" : function() {
                var bValid = true;

                bValid = bValid && checkLength(name, "naam: ", 3, 16);

                if (bValid) {
                    var json_string = new Array();
                    json_string.push('{"basetype":"' + basetype + '", "filename": "' + name.val() + '"}');
                    $('#question_list_container > ul').find('li').each(function() {
                        json_string.push(process_question($(this)));
                    });
                    $.ajax({
                        type : 'POST',
                        url : base_url + '/xmlprovider/questions/save_questionaire',
                        dataType : 'json',
                        data : {
                            data : '[' + json_string.join(',') + ']'
                        },
                        success : function(data) {
                            $(data).each(function() {
                                console.log(this);
                            });
                            console.log(data.responseText);
                            smsrespons = data.responseText.split(';');
                            muiscode = smsrespons[0];
                            alert('De peiling is succesvol opgeslagen onder naam: ' + muiscode.replace('MUIS_', ''));
                            window.open('http://www.scholenmetsucces.nl/vragenplanner/deelnameformulier?AVL=' + smsrespons[0], '_top');
                        },
                        error : function(data) {
                            $(data).each(function() {
                                //                    console.log(this);
                            });
                            console.log(data.responseText);
                            alert('Er is iets fout gegaan in de aanmaak van de peiling' + data.responseText);
                        }
                    });
                    $(this).dialog("close");

                }
            },
            Cancel : function() {
                $(this).dialog("close");
            }
        },
        close : function() {
            allFields.val("").removeClass("ui-state-error");
        }
    });

    $('#name, #filter_field').keydown(function(event) {
        if ((event.keyCode == 13)) {
            event.preventDefault();
            return false;
        }
    });

    $("#save_question_list").click(function() {
        $("#save_questionaire").dialog("open");
    });
}

function isInt(value) {
    return !isNaN(parseInt(value, 10)) && (parseFloat(value, 10) == parseInt(value, 10));
}
