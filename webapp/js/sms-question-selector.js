var basetype = "";
var school_id;

$(document).ready(function() {
    //set all pages to display:none
    $("div[data-role='page']").hide();

    $('#testpagebutton').click(function() {
        load_page('#testpage');
    });
    //init_login();
    init_login_temp();
    select_survey_type();

});
function load_page(page) {
    $("div[data-role='page']").hide();
    $(page).fadeIn(500);
}

function init_login_temp() {
	$.ajax({
		type: 'GET',
  		url: base_url + '/xmlprovider/questions/school_id',
  		dataType: 'xml',
  		success: function(xml){
    		$(xml).find('xml').each(function(){
    			school_id = $(this).find('school_id').text();
    		});
  		}
	});	
}

function init_login() {
    //see if we are already logged in
    $.post(base_url + "/index.php/auth/login", {}, function(data) {
        error = $(data).find(".error");
        //alert(data);
        if(error.length == 0) {
            $('#login').fadeOut(500, function() {
                $('#typechoice').fadeIn(500);
            });
        } else {
            load_page('#login');
        }
    });
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
            if(error.length == 0) {
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

function select_survey_type() {
	$('#typechoice').fadeIn(500);
	wireTypeChange();
}

function retrieve_questions_per_type( type ) {
	var questions = new Array();

	$.ajax({
		type: 'GET',
  		url: base_url + '/xmlprovider/questions/all_questions/' + type,
  		dataType: 'xml',
  		success: function(xml){
    		$(xml).find('item').each(function() {
    			
    			var li = '<li class="ui-state-default" id="' + $(this).find('question_id').text() + '">' + $(this).find('question_description').text() + '</li>';
    			$(li).appendTo('#questions_container');
    		});
    		
    		createSorts();
  		}
	});
	
}

function wireTypeChange() {
	$('#select_type').change(function() {
		retrieve_questions_per_type( $(this).val() );
		$('#survey_type').remove();
	});
}

function createSorts() {
	$('.sorts').sortable({
		connectWith: '.connectedSortable',
		update: function(event, ui) {
			if ( $( this ).attr( 'id' ) === 'question_list_container' ) {
				var order = $(this).sortable('toArray').toString();
				console.log(order);
			}
		},
		stop: function(event, ui) {
			var list = $('#question_list_container > li' );
			if ( list.length >= 1 ) {
				$('.info').remove();
			}
			else {
				$('<li class="info error">Sleep hier uw vragen heen</li>').appendTo('#question_list_container');
			}
		}
	}).disableSelection();
	
	filter_questions();
}

function filter_questions() {
	$('#filter_field').keyup( function() {
		var re = $('#filter_field').val();

		$('#questions_container > li').each( function() {
			
			var str = $(this).text();
			var match = str.search(re);

			if ( match == -1) {
				$(this).addClass('hide');
			}
			else {
				$(this).removeClass('hide');
			}
		});
	});
}
