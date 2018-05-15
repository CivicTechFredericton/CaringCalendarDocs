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

});