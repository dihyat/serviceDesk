
$('.showForm').click(function(){
        $('.update-post').attr('id',"updatePost_"+$(this).attr('id'));
        $('.update-post').show();

    })

    $('.devUpdate').click(function(){
        $('.create-developer').attr('id',"create-developer_"+$(this).attr('id'));
        $('.create-developer').show();

    })


    /*
        Post request for incident model
    */
    $("#incident-form").submit(function (e) {
        // preventing from page reload and default actions
        e.preventDefault();
        
        // serialize the data for sending the form data.
        var serializedData = $(this).serialize();
        // make POST  call
        $.ajax({
            type: 'POST',
            url: "{% url 'post_incident' %}",
            data: serializedData,
            success: function (response) {
                
                // on successfull creating object clear the form.
                $("#incident-form").trigger('reset');
                 
                $("#id_first_name").focus();

                
                var instance = JSON.parse(response["instance"]);
                var dev_instance = JSON.parse(response["dev_instance"])
                
                var fields = instance[0]["fields"];
                var looper = ""
                var email = ""
                //storing the Developer model fields
                $.each(dev_instance, function(index,dev){
                    looper += dev.fields.team_name + " "
                    email += dev.fields.team_email +" "
                    
                })
                
                $('#dev-form #id_incidents').append(`'<option value="${instance[0].pk}">${fields["company_name"]}</option>'`)


                $("#incidents tbody").prepend(
                    `<tr>
                    <td>${fields["company_name"]||""}</td>
                    <td>${fields["first_name"]||""}</td>
                    <td>${fields["last_name"]||""}</td>
                    <td>${fields["issue_time"]||""}</td>
                    <td>${looper}</td>
                    <td>${email}</td>
                    <td><button id = "${instance[0].pk}" class="btn btn-danger btn-del postDelete" >DELETE</button></td>
                    <td><button type="button" id = "${instance[0].pk}" class="btn btn-secondary showForm" data-toggle="modal" data-target="#updateForm">
                        Update
                    </button></td>
                    <tr>
                    `
                    
                )
                
            },
            error: function (response) {
                // alert the error if any error occured
                alert(response["responseJSON"]["error"]);
            }
        })
    })

    /*
    call AJAX get request to check if the company name
    already exists or not.
    */
    $("#id_company_name").focusout(function (e) {
        e.preventDefault();
        
        var company_name = $(this).val();
        // GET AJAX request
        $.ajax({
            type: 'GET',
            url: "{% url 'validate_name' %}",
            data: {"company_name": company_name},
            success: function (response) {
                //alert the user if the they are inpuutting invalid name
                if(!response["valid"]){
                    alert("You cannot create an incident with same company name");
                    var firstName = $("#id_company_name");
                    firstName.val("")
                    firstName.focus()
                }
            },
            error: function (response) {
                console.log(response)
            }
        })
    })
    
    
    

    
    //Delete request for incident model
    $(document).on('click','.postDelete',(function(){
        var test_id = $(this).attr('id')
        var row = $(this).parent().parent()
            
        $.ajax({
            method:"DELETE",
            url: "{% url 'delete post' 0 %}".replace("0", test_id),
                
            success: function(data){
                row.remove()

                $(`#dev-form #id_incidents option[value="${test_id}"`).remove();
                    
            }
                 
        })
    }));
    
    
        // PUT request for Incident model
        $(document).on('submit','.update-post',function(e){
            e.preventDefault();
            //getting the id
            var test_id = $('.update-post').attr('id').split('_')[1]; 
            var all_dev = $('#updatePost_'+test_id+' #id_developer').val();
            var str_dev = '';
            
            $.each(all_dev,function(index, value){
                str_dev += value+' ';
            })
            
            $.ajax({
                method:"PUT",
                url: "{% url 'update post' 0 %}".replace("0", test_id),
                data: {
                    company_name: $('#updatePost_'+test_id+' #id_company_name').val(),
                    first_name: $('#updatePost_'+test_id+' #id_first_name').val(),
                    last_name: $('#updatePost_'+test_id+' #id_last_name').val(),
                    developer: str_dev
                    
                },
                
                
                success: function(response){
                    var company_name = $("#company_name"+test_id);
                    var first_name = $("#first_name"+test_id);
                    var last_name = $("#last_name"+test_id);
                    var issue_time = $("#issue_time"+test_id);
                    var dev_name = $("#dev_team"+test_id);
                    var team_email = $("#team_email"+test_id);



                    var instance = JSON.parse(response["instance"]);
                    var dev_instance = JSON.parse(response["dev_instance"]);

                    var fields = instance[0]["fields"];
                    var team_name= ""
                    var email = ""
                    
                    $.each(dev_instance, function(index,dev){
                        team_name += dev.fields.team_name + " "
                        email += dev.fields.team_email +" "
                        
                    })
                    
                    $('#dev-form #id_incidents').append(`'<option value="${instance[0].pk}">${fields["first_name"]}</option>'`)

                    company_name.text(fields.company_name);
                    first_name.text(fields.first_name);
                    last_name.text(fields.last_name);
                    dev_name.text(team_name);
                    team_email.text(email);


                    
                }
                 
            })


        })


        //Post request for Developer model
        $(document).ready(function() {

            $("#dev-form").submit(function (e) {
            // preventing from page reload and default actions
            e.preventDefault();
            
            // serialize the data for sending the form data.
            var serializedData = $(this).serialize();
            
            function searchID() {
                var select1 = document.getElementById("id_incidents");
                var selected1 = [];
                for (var i = 0; i < select1.length; i++) {
                if (select1.options[i].selected) selected1.push(select1.options[i].value);
                }
                console.log(selected1);
                return selected1;
            }

            var ids = searchID();
            // make POST ajax call
            $.ajax({
                type: 'POST',
                url: "{% url 'create_developer' %}",
                data: serializedData,
                success: function (response) {
                    
                    // on successfull creating object clear the form.
                    $("#dev-form").trigger('reset');
                    
                    $("#id_first_name").focus();

                    // display the newly dev to table.
                    var instance = JSON.parse(response["instance"]);
                    var fields = instance[0]["fields"];
                    
                    $('#incident-form #id_developer').append(`'<option value="${instance[0].pk}">${fields["team_name"]}</option>'`);
                    
                    ids.forEach(function(index,value){
                        
                        var dev = `'#dev_team${index}'`;
                        var inc = `#inc-${index}`;
                        $('#dev_team'+index).text(`${fields["team_name"]}`);
                        
                    })

                    $("#dev_info tbody").prepend(
                        `<tr>
                        <td>${fields["team_name"]||""}</td>
                        <td>${fields["team_email"]||""}</td>
                        <td>${fields["team_number"]||""}</td>
                        <td><button id = "${instance[0].pk}" class="btn btn-danger btn-del devDelete" >DELETE</button></td>
                        <td><button type="button" id="${instance[0].pk}" class="btn btn-secondary devUpdate" data-toggle="modal" data-target="#dev_form_modal">
                            Update
                        </button></td>
                        <tr>
                        `
                        
                    )
                    
                },
                error: function (response) {
                    alert(response["responseJSON"]["error"]);
                }
            })
        })
    });

     //Delete request
     $(document).on('click','.devDelete',(function(){
        var test_id = $(this).attr('id');
        var row = $(this).parent().parent();
            
        $.ajax({
            method:"DELETE",
            url: "{% url 'delete developer' 0 %}".replace("0", test_id),
                
            success: function(data){
                row.remove();
                $(`#incident-form #id_developer option[value="${test_id}"`).remove();
                    
            }
                 
        })
    }));
    //GET request
    $("#id_team_name").focusout(function (e) {
        e.preventDefault();
        
        var team_name = $(this).val();
        // GET AJAX request
        $.ajax({
            type: 'GET',
            url: "{% url 'validate_team_name' %}",
            data: {"team_name": team_name},
            success: function (response) {
                // if not valid user, alert the user
                if(!response["valid"]){
                    alert("A developer team with the same name exists");
                    var teamName = $("#id_team_name");
                    teamName.val("")
                    teamName.focus()
                }
            },
            error: function (response) {
                console.log(response)
            }
        })
    })

    //PUT request 
    $(document).on('submit','.create-developer',function(e){
            e.preventDefault();
            
            var test_id = $('.create-developer').attr('id').split('_')[1]; 

            $.ajax({
                method:"PUT",
                url: "{% url 'update developer' 0 %}".replace("0", test_id),
                data: {
                    team_name: $('#create-developer_'+test_id+' #id_team_name').val(),
                    team_email: $('#create-developer_'+test_id+' #id_team_email').val(),
                    team_number: $('#create-developer_'+test_id+' #id_team_number').val(),
                },
                
                success: function(response){
                    var team_name = $("#team_name"+test_id);
                    var team_email = $("#team_email"+test_id);
                    var team_number=$("#team_number"+test_id);

                    var dev_instance = JSON.parse(response["dev_instance"]);
                    
                    
                    var fields = dev_instance[0]["fields"];
                    $('#incident-form #id_developer').append(`'<option value="${dev_instance[0].pk}">${fields["team_name"]}</option>'`);

                    team_name.text(fields.team_name);
                    team_email.text(fields.team_email);
                    team_number.text(fields.team_number);
   
                }                 
            })

        })
    
