var VK_IS_TEST_MODE = true;

VK.init(function() { 
    VK.callMethod("resizeWindow", 910, 600);
    VK.api("users.get", {
        "test_mode": VK_IS_TEST_MODE,
        fields: "first_name,last_name,sex,city,country,photo_100"
    }, function(data){
        console.log(data);
    });
}, function() { 
    console.log("fail");
}, '5.2');