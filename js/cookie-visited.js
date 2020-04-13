if(document.cookie.indexOf('visited-' + location.hostname) == -1)
{
    var day = 7*86400000;
    document.cookie = 'visited=visited-' + location.hostname + ';max-age=' + day + ';domain=' + location.hostname + ';path=/';
    $('#myModal').css('display','block');
}
