var VK_IS_TEST_MODE = true;


function initVK(){
    VK.init(function() { 
        VK.api("users.get", {
            "test_mode": VK_IS_TEST_MODE,
            fields: "first_name,last_name,sex,city,country,photo_100"
        }, function(data){
            console.log(data);
        });
    }, function() { 
        console.log("VK.init fail");
        setTimeout(initVK, 3000);
    }, '5.2');
}

initVK();