$(function() {
    $('#calendar').fullCalendar({
        defaultView: 'agendaWeek',
        header: {
            left: 'month,agendaWeek,agendaDay',
            center: 'title',
            right:  'today prev,next'
        },
        themeSystem: 'bootstrap4'
    });

    $('#registration-form').on('submit', function(e) {
        e.preventDefault();
        var validated = true;
        $('.validate', this).each(function() {
            if ($(this).val() == '') {
                validated = false;
                $(this).addClass('invalid');
            }
        });
        if ($('#password').val() != $('#password2').val()) {
            $('#password2').addClass('invalid');
            validated = false;
        } else {
            $('#password2').removeClass('invalid');
        }
        if (validated) {
            // submit that form!
        }
        return false;
    });
    $('.validate').on('keyup', function() {
        $(this).removeClass('invalid');
    });
});