	$(document).ready(function() {
		// Script to enable hover function
		$('.hoverable').hover(
			function() {
				$(this).addClass('hovered');
			}, function() {
				$(this).removeClass('hovered');
			});

		// Carousel 
		$("#photos").galleryView({
			// 2.0:
			show_panels: false,
			show_captions: false,
			start_frame: 3,
			filmstrip_size: 5,
			frame_width: 140,
			frame_height: 140,
			frame_opacity: 1.0,
			transition_speed: 350,
			easing: 'easeInOutQuad',
			transition_interval: 2000,
			nav_theme: "light",
			pause_on_hover: true
		});

		// Select box form submitter
		$("form.jump select.jump").change(function() {
			that = $(this).parents("form.jump");
			$(that).submit();
		});

		$("form.jump input.hideme").hide();

		// Hides the other-media links
		$(".other-media").each(function() {
			$(this).hide();
		});

		// Cookie initialization for the facet list
		var COOKIE_NAME = 'siFacetCookie';
		var COOKIE_TEXT = '|online_media_type-grp||object_type-grp||search_term-grp|';
		var COOKIE_OPTS = {path: '/', expires: 360};

		// set cookie
		if (!$.cookie(COOKIE_NAME)) {
			$.cookie(COOKIE_NAME, 'c' + COOKIE_TEXT, COOKIE_OPTS);
		}

		// cookie debugging functions
		$("a.cookiecheck").click(function(){ alert( $.cookie(COOKIE_NAME) ); return false; });
		$("a.cookieclear").click(function(){ $.cookie(COOKIE_NAME, 'c' + COOKIE_TEXT, COOKIE_OPTS); return false; });

		// Enables the facet list titles to toggle the view states for each facet
		$(".facet h3").click(function(){
			myParent = $(this).parent();

			ourCookieText = "|" + myParent.attr('id') + "|";
			ourCookie = $.cookie(COOKIE_NAME);

			if (myParent.hasClass("inactive")) {
				myParent.removeClass("inactive");
				myParent.addClass("active");

				$(".facet-control", myParent).show();

				$(this).attr("title", "collapse");
				$.cookie(COOKIE_NAME, ourCookie + ourCookieText, COOKIE_OPTS);
			} else {
				myParent.removeClass("active");
				myParent.addClass("inactive");

				$(".facet-control", myParent).hide();

				$(this).attr("title", "expand");
				$.cookie(COOKIE_NAME, ourCookie.replace(ourCookieText, ''), COOKIE_OPTS);
			}
		}).each(function(){
			myParent = $(this).parent();

			ourCookieText = "|" + myParent.attr('id') + "|";
			ourCookie = $.cookie(COOKIE_NAME);

			$(this).css('cursor', 'pointer');

			if (myParent.hasClass("inactive")) {
				$(this).attr("title", "collapse");
				$(".facet-control", myParent).hide();
			} else {
				$(this).attr("title", "expand");
			}

			strLocation = ourCookie.indexOf(ourCookieText);

			if (strLocation == -1) {
				myParent.removeClass("active");
				myParent.addClass("inactive");

				$(".facet-control", myParent).hide();

				$(this).attr("title", "expand")
			} else {
				myParent.removeClass("inactive");
				myParent.addClass("active");

				$(".facet-control", myParent).show();

				$(this).attr("title", "collapse");
			} 
		});

		// Enables the expand/collapse buttons for the result listing
		/*
		$(".listing .record-tog .toggle .toggle2").click(function(){
			myParent = $(this).parent().parent();

			if (myParent.hasClass("inactive")) {
				myParent.removeClass("inactive");
				myParent.addClass("active");
				$(this).html("collapse");
			} else {
				myParent.removeClass("active");
				myParent.addClass("inactive");
				$(this).html("expand");
			}
		});
		*/

		$(".listing .record-tog .toggle").each(function(){
			if ($(this).parent().hasClass("inactive")) {
				$(this).append('<a class="toggle2">expand</a>');

				that = $(this).children('.toggle2');

				$(that).click(function(){
					myParent = $(this).parent().parent();

					if (myParent.hasClass("inactive")) {
						myParent.removeClass("inactive").addClass("active");
						$(this).html("collapse");
					} else {
						myParent.removeClass("active").addClass("inactive");
						$(this).html("expand");
					}
				});
			}
		});

		$("#toggle-all-results").click(function() {
			if ($(this).text() == 'expand all') {
				$(".listing .record-tog").each(function(){
					$('.toggle2', this).html("collapse");
					$(this).removeClass("inactive").addClass("active");
				});

				$(this).text('collapse all');
			} else {
				$(".listing .record-tog").each(function(){
					$('.toggle2', this).html("expand");
					$(this).removeClass("active").addClass("inactive");
				});

				$(this).text('expand all');
			}
		});

		// 
		$(".si-tabset").each(function() {
			$(" a.si-tab", this).each(function(dex){
				hash = $(this).attr("href");

				//if ($(hash).hasClass("active") == false) {
				if (dex == 0) {
					// Set this tab to selected
					$(this).addClass("si-tab-selected");
				} else if (dex > 0) {
					$(hash).hide();
				}
			}).click(function(){
				// Get the ID of this tab's content
				hash = $(this).attr("href");

				// Hide all the tabs' content
				$(".si-tab-container", $(this).parent().parent()).hide();

				// Show the clicked tab's content
				$(hash).show();

				// Reset all the tabs' states
				$(".si-tab", $(this).parent()).removeClass("si-tab-selected");

				// Set this tab to selected
				$(this).addClass("si-tab-selected");

				// Don't send the click to the browser
				return false;
			});
		});

		$(".facet-control a.more").each(function() {
			this.href += "&inline=true";
		}).colorbox({
			transition: "fade", 
			width: "750", 
			height: "600", 
			iframe: true, 
			title: function() {
				myTitle = $("#tooltip h3").text();
				return myTitle;
			}
		});

		$("a.thumbnail").colorbox({
			transition: "none", 
			width: "90%", 
			height: "90%", 
			opacity: 0.45,
			iframe: true, 
			title: function() {
				myTitle = $("#tooltip h3").text();
				return myTitle;
			}
		}).click(function(){ return false; });

		$(".other-media-toggle").each(function() {
			$(this).attr('title', 'click to see other media');

			var myTargetID = $(this).attr("href");
			var myTarget = $(myTargetID);

			myTargetKids = myTarget.children("a");

			if (myTargetKids.length == 1) {
				newURL = myTargetKids[0];
				$(this).attr("href", newURL).attr("target", "_blank");
			} else {
				$(this).bind("click", function() {
					myTarget.toggle();
					check = myTarget.css("display");

					if (check == 'none') {
						newHTML = 'click to see<br />other media';
					} else {
						newHTML = 'click to<br />minimize';
					}

					$(this).html(newHTML);

					return false;
				});
			}
		});
		
		$(".results .listing li.record .other-media a img").each(function() {
			bg = $(this).attr("src");
			$(this).parent().css("background", "#FFF url(" + bg + ") no-repeat 50% 50%");
			$(this).hide();
		});

		// Tool Tips: sets the tool tip renderer on the facet list titles
		// Tool Tips: sets the tool tip rendered on the map areas
		// Tool Tips: apply to all anchors except things controlled by colorbox
		//$("a:not(a.thumbnail, a.more)").tooltip({
		$("h3.title, area, a:not(a.carousel-link)").tooltip({
			track: true,
			delay: 0,
			showURL: false,
			showBody: " - ",
			top: 20, 
			left: 0
		});

		/*
		$(".criteria-toggle").toggle(
		function() {
			myParent = $(this).parent();
			$(".criteria", myParent).show();
			$(this).text('Hide Additional Criteria');
		}, function() {
			myParent = $(this).parent();
			$(".criteria", myParent).hide();
			$(this).text('Show Additional Criteria');
		});
		*/
	});
	$("#toggle-all-results").click(function() {
		if ($(this).text() == 'expand all') {
			$(".listing .record-tog").each(function(){
				$('.toggle2', this).html("collapse");
				$(this).removeClass("inactive").addClass("active");
			});

			$(this).text('collapse all');
		} else {
			$(".listing .record-tog").each(function(){
				$('.toggle2', this).html("expand");
				$(this).removeClass("active").addClass("inactive");
			});

			$(this).text('expand all');
		}
	});
