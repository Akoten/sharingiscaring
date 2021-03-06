/**
 @toc
 */
'use strict';
angular.module('Akoten.sharingiscaring', [])
    .provider("sicFacebook", function () {
        var appId;
        var rScope;

        function initSDK(newRootScope) {
            rScope = newRootScope;
            rScope.$broadcast("sicFacebookInit");
            if (!window.fbApiInitialized) {
                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {
                        return;
                    }
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "//connect.facebook.net/en_US/sdk/debug.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
                window.fbAsyncInit = function () {
                    FB.init({
                        appId: appId,
                        xfbml: true,
                        version: 'v2.1'
                    });
                    window.fbApiInitialized = true;
                };
            }
        }

        function fbUI(properties) {
            if (window.fbApiInitialized) {
                FB.ui(properties);
            }
        }

        function execIfLoggedIn(callback, actionScope) {
            if (window.fbApiInitialized) {
                FB.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        callback();
                    }
                    else {
                        FB.login(function (response) {
                            callback();
                        }, {scope: actionScope});
                    }
                });
            } else {
                rScope.$broadcast("sicFacebookError", "App not initialized.");
            }
        }

        function validateSharingDomain(link) {
            var tmp = document.createElement('a');
            tmp.href = link;
            if (tmp.hostname === location.hostname) {
                return true;
            } else {
                alert("You should only share content that resides on the same domain as the one that is shared from.")
                return false;
            }
        }

        return {
            setAppId: function (newAppId) {
                appId = newAppId;
            },
            $get: function ($injector) {
                var rScope = $injector.get("$rootScope");
                initSDK(rScope);
                return {
                    shareOpenGraph: function (actionType, properties) {
                        if(validateSharingDomain(properties['og:url'] ? properties['og:url'] : location.hostname)) {
                            execIfLoggedIn(fbUI({
                                method: 'share_open_graph',
                                action_type: actionType,
                                action_properties: JSON.stringify(properties)
                            }), 'publish_actions');
                        }
                    },
                    share: function (link) {
                        if (validateSharingDomain(link)) {
                            execIfLoggedIn(fbUI({
                                method: 'share',
                                href: link
                            }));
                        }
                    }
                }
            }
        };
    })
    .directive("sicFacebookOgShare", ['sicFacebook', function (sicFacebook) {
        return {
            restrict: "EA",
            controller: function ($scope) {
                $scope.shareOpenGraph = function () {
                    var properties = {};
                    properties[$scope.ogObjectKey] = $scope.ogObjectValue;
                    properties["og:url"] = $scope.ogUrl;
                    properties["og:title"] = $scope.ogTitle;
                    properties["og:type"] = $scope.ogType;
                    properties["og:image"] = $scope.ogImage;
                    properties["og:description"] = $scope.ogDescription;
                    sicFacebook.shareOpenGraph($scope.ogActionType, properties);
                }
            },
            link: function (scope, element) {
                element.on('click', function () {
                    scope.shareOpenGraph();
                })
            },
            scope: {
                ogObjectKey: "@",
                ogObjectValue: "@",
                ogActionType: "@",
                ogUrl: "@",
                ogTitle: "@",
                ogType: "@",
                ogImage: "@",
                ogDescription: "@",
                anchorElementContent: "@"
            },
            template: "<a ng-bind='anchorElementContent'></a>"
        }
    }])
    .directive("sicFacebookShare", ["sicFacebook", function (sicFacebook) {
        return {
            restrict: "EA",
            controller: function ($scope) {
                $scope.doShare = function () {
                    sicFacebook.share($scope.sicShareLink);
                };
            },
            link: function (scope, element) {
                element.on('click', function () {
                    scope.doShare();
                })
            },
            scope: {
                sicShareLink: "@",
                anchorElementContent: "@"
            },
            template: "<a ng-bind='anchorElementContent'></a>"
        }
    }])
    .directive("sicFacebookSimple", function () {
        return {
            restrict: "EA",
            template: '<div></div>',
            link: function (scope, element, attributes) {
                element = element.find("div");
                scope.sicFbLayout ? element.attr("data-layout", scope.sicFbLayout) : null;
                scope.sicFbUrl ? element.attr("data-href", scope.sicFbUrl) : element.attr("data-href", "https://developers.facebook.com/docs/plugins/");
                scope.sicFbAction ? element.attr("data-action", scope.sicFbAction) : null;
                scope.sicFbFaces === "false" ? element.attr("data-show-faces", "false") : element.attr("data-show-faces", "true");
                angular.isNumber(scope.sicFbWidth) ? element.attr("data-width", scope.sicFbWidth) : null;
                angular.isNumber(scope.sicFbHeight) ? element.attr("data-height", scope.sicFbHeight) : null;
                scope.sicFbClass ? element.attr("class", scope.sicFbClass) : element.attr("class", "fb-like");
                scope.sicFbColorScheme === "light" || scope.sicFbColorScheme === "dark" ? element.attr("data-colorscheme", scope.sicFbColorScheme) : null;
                angular.isNumber(scope.sicFbNumPosts) && scope.sicFbClass === "fb-comments" ? element.attr("data-numposts", scope.sicFbNumPosts) : null;
                scope.sicFbOrderBy === "social" || /^(reverse_)?time$/.test(scope.sicFbOrderBy) ? element.attr("data-order-by", scope.sicFbOrderBy) : null;
                scope.sicFbStream === "true" || scope.sicFbStream === "false" ? element.attr("data-stream", scope.sicFbStream) : null;
                scope.sicFbForceWall === "true" || scope.sicFbForceWall === "false" ? element.attr("data-force-wall", scope.sicFbForceWall) : null;
                scope.sicFbShowBorder === "true" || scope.sicFbShowBorder === "false" ? element.attr("data-show-border", scope.sicFbShowBorder) : null;
            },
            scope: {
                sicFbLocale: '@',
                sicFbUrl: '@',
                sicFbWidth: '@',
                sicFbAction: '@',
                sicFbIncludeShare: '@',
                sicFbLayout: '@',
                sicFbFaces: '@',
                sicFbClass: '@',
                sicFbHeight: '@',
                sicFbColorScheme: '@',
                sicFbNumPosts: '@',
                sicFbOrderBy: '@',
                sicFbStream: '@',
                sicFbForceWall: '@',
                sicFbShowBorder: '@',
            }
        }
    }).directive("sicTwitter", [function () {
        return {
            restrict: "EA",
            template: '<a></a>',
            link: function (scope, element) {
                element = element.find("a");
                scope.sicTwitUrl ? element.attr("href", scope.sicTwitUrl) : element.attr("href", "https://twitter.com/share");
                scope.sicTwitClass ? element.attr("class", scope.sicTwitClass) : element.attr("class", "twitter-share-button");
            },
            scope: {
                sicTwitUrl: '@',
                sicTwitClass: '@'
            },
            transclude: true
        }
    }]);