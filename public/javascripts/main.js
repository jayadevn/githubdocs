$(document).ready(function(){
    // if there is a hash, trigger the change event to display the doc
    if(window.location.hash){
        $(window).trigger('hashchange');
    }

    // current sidebar links on page load
    getDocs(function(response){
        // create sidebar list from response
        populateSideMenu(response.docs);

        // set the navbar brand title from config
        $('.navbar-brand, .brand-logo').html(response.config.title);

        // set the hash to the first doc
        if(window.location.hash === '' && response.docs.length > 0){
            window.location.hash = '#' + response.docs[0].docSlug;
        }

        // store the inital list for later
        var currentListGroup = $('.sidebarLink');;

        // populate the top menu
        populateTopMenu();

        // if user searches
        $('#searchInput').on('keyup', function(){
            // only search if input more than 2 chars
            if($('#searchInput').val().length > 2){
                $.ajax({
                    method: 'POST',
                    data: {keyword: $('#searchInput').val()},
                    url: '/search'
                })
                .done(function(response, status){
                    if(status === 'success'){
                        // remove current list
                        $('.sidebarLink').remove();

                        $.each(response, function(key, value){
                            $('.sidebar').append('<li class="list-group-item collection-item sidebarLink"><a href="#' + value.docSlug + '">' + value.docTitle + '</a></li>');
                        });
                    }else{
                        // remove current list
                        $('.sidebarLink').remove();
                        $('.sidebar').append(currentListGroup);
                    }
                });
            }else{
                // remove current list
                $('.sidebarLink').remove();
                $('.sidebar').append(currentListGroup);
            }
        });
    });

    $('.sidebarToggle').click(function(){
        $('.sidebar-container').toggleClass('sidebar-container-show');
    });

    $('body').on('click', '.sidebarLink a', function() {
        $('.sidebar-container').toggleClass('sidebar-container-show');
    });
});

$(window).bind('hashchange', function(){
    scrollTo();
    if(window.location.hash.trim() === '#' || window.location.hash.trim() === ''){
        getDocs(function(response){
            // show the first doc
            if(response.docs.length > 0){
                $('#main').html(response.docs[0].docBody);
                setMetaTags(response.docs[0]);
                window.location.hash = '#' + response.docs[0].docSlug;
            }else{
                $('#main').html('<h3>No docs. Please create some docs.<h3>');
            }
        });
    }else{
        $.ajax({
            method: 'GET',
            url: '/doc/' + parseURL().hash
        })
        .done(function(response, status){
            $('#main').html(response.doc.docBody);
            setMetaTags(response.doc);

            if(response.doc.nextDoc){
                $("#linkNext a").attr("href", "#" + response.doc.nextDoc.docSlug);
                $("#linkNext a").removeClass("hidden hide");
            }else{
                $("#linkNext a").addClass("hidden hide");
            }
            if(response.doc.prevDoc){
                $("#linkPrev a").attr("href", "#" + response.doc.prevDoc.docSlug);
                $("#linkPrev a").removeClass("hidden hide");
            }else{
                $("#linkPrev a").addClass("hidden hide");
            }

            $("pre code").each(function(i, block) {
                hljs.highlightBlock(block);
            });

            $("img").each(function(value) {
                $(this).parent().addClass("center-align align-center")
                $(this).addClass("img-responsive responsive-img")
            });

            // add anchor points to headings
            if(response.config.addAnchors){
                var url = parseURL();
                $("h1, h2, h3, h4, h5").each(function(value) {
                    var origText = $(this).text();
                    $(this).html("<a name='" + origText + "' href='#" + url.hash + "/" + origText + "'>" + origText + "</a>")
                });

                // scroll to given anchor
                scrollTo();
            }
        });
    }
});

function parseURL(){
    var url = window.location.hash;
    url = url.split("/");
    url.hash = url[0].substring(1, window.location.hash.length)
    if(url.length > 0){
        url.anchor = url[1];
    }

    return url;
}

// scrolls to an anchor point
function scrollTo(){
    var url = parseURL();
    var anchor = $("a[name='"+ url.anchor +"']");
    if(anchor.length){
        $('html,body').animate({scrollTop: anchor.offset().top},'slow');
    }
}

// gets the docs from the API
function getDocs(callback){
    $.ajax({
        method: 'GET',
        url: '/sidebar'
    })
    .done(function(response, status){
        callback(response);
    });
}

// cleans HTML
function stripHTML(dirtyString){
    return $(dirtyString).text().trim();
}

// sets the mega tags for the page
function setMetaTags(doc){
    document.title = doc.docTitle;
    $("meta[property='og\\:title']").attr("content", doc.docTitle);
    $('meta[name=title]').attr('content', doc.docTitle);
    if(stripHTML(doc.docBody).length > 160){
        $("meta[property='og\\:description']").attr('content', stripHTML(doc.docBody.substring(0,200)));
        $('meta[name=description]').attr('content', stripHTML(doc.docBody.substring(0,200)));
    }else{
        $("meta[property='og\\:description']").attr('content', stripHTML(doc.docBody));
        $('meta[name=description]').attr('content', stripHTML(doc.docBody));
    }
}

function populateSideMenu(data){
    $.each(data, function(key, value){
        $('.sidebar').append('<li class="list-group-item collection-item sidebarLink"><a href="#' + value.docSlug + '">' + value.docTitle + '</a></li>');
    });
}

function populateTopMenu(){
    $.ajax({
        method: 'GET',
        url: '/config'
    })
    .done(function(response, status){
        $.each(response.menuItems, function(key, value){
            $('.nav').append('<li><a href="' + value.menuLink + '">' + value.menuTitle + '</a></li>');
        });
    });
}