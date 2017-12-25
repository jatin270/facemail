$(function() {
    var alreadyFilled = false;
    var states=[];
    $.get('/sendata',{},function (data) {
        data.user.forEach(function (t) {
            states.push(t);
        });

        function initDialog() {
            clearDialog();
            for (var i = 0; i < states.length; i++) {
                $('.dialog').append('<div>' + states[i] + '</div>');
            }
        }
        function clearDialog() {
            $('.dialog').empty();
        }
        $('.autocomplete input').click(function() {
            if (!alreadyFilled) {
                $('.dialog').addClass('open');
            }
        });
        $('body').on('click', '.dialog > div', function() {
            $('.autocomplete input').val($(this).text()).focus();
            $('.autocomplete .close').addClass('visible');
            alreadyFilled = true;
        });
        $('.autocomplete .close').click(function() {
            alreadyFilled = false;
            $('.dialog').addClass('open');
            $('.autocomplete input').val('').focus();
            $(this).removeClass('visible');
        });
        function match(str) {
            str = str.toString().toLowerCase();
            clearDialog();
            for (var i = 0; i < states.length; i++) {
                if (states[i].toString().toLowerCase().startsWith(str)) {
                    $('.dialog').append('<div>' + states[i] + '</div>');
                }
            }
        }
        $('.autocomplete input').on('input', function() {
            $('.dialog').addClass('open');
            alreadyFilled = false;
            match($(this).val());
        });
        $('body').click(function(e) {
            if (!$(e.target).is("input, .close")) {
                $('.dialog').removeClass('open');
            }
        });
        initDialog();
    });
});