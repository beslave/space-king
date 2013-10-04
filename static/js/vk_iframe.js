var VK_IS_TEST_MODE = true;
var UPDATE_FREQUENCY = 24 * 60 * 60 * 1000;

function initVK(){
    VK.init(function() {
        if(new Date().getTime() - USER_INFO.last_update > UPDATE_FREQUENCY){
            VK.api('users.get', {
                'test_mode': VK_IS_TEST_MODE,
                fields: 'first_name,last_name,sex,city,country,photo_100'
            }, function(data){
                if(data.response){
                    var request = {};
                    for(var field in data.response[0]) request[field] = data.response[0][field];
                    request._csrf_token = $('input[name="_csrf_token"]').first().val();
                    $.ajax({
                        url: '/update_profile_from_vkontakte',
                        type: 'POST',
                        data: request,
                        success: function(data){
                            log("profile is updated");
                        },
                        error: function(error){
                            log(error);
                        }
                    });
                }
            });
        }
    }, function() { 
        console.log('VK.init fail');
        setTimeout(initVK, 3000);
    }, '5.2');
}

initVK();