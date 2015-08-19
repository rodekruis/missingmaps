(function(){
  // extend app w/ map module
  $.extend(app, {
    osmHistoryBaseURL: 'https://api.developmentseed.org/osm?search=comment:%22missingmaps benin%22&limit=1000&skip=0',
    blacklist: ['JamesLC','YalCat','kr12','danbjoseph','Badoncal','MapperJason','LPS1','Idaes','sirwin559', 'Seosamh','Colin_Thompson','Steven_Boyd', 'KellyMcKee','Simon Little', 'pialonso', 'Des Gale', 'GemmaMcE','IndyMapper','Vormav','juanda097', 'WilliamGr','Leonmvd','captain_slow','samuelestabrook','pedrito1414'],
    contributorGeoJSONLayer: null,
    loadingContributorGeoJSON: false,
    initLeaderboard: function(){
      // see mapoff sample site: http://mapgive.state.gov/events/mapoff/results/
      // user_list.json
        // nodes/ways/relations/changesets per user
      // ways_per_tag.json
        // ways per changeset
      // user.json
        // geojson of user's edits (malformed?)

      // nice to have
        // user contributions over time
        // total contributions over time

      this.loadContributors();

    },

    loadContributors: function(){
      $.getJSON(app.osmHistoryBaseURL, function(data){
        var result = Enumerable.From(data.results)
            .GroupBy("$.user", null,
                function (key, g) {
                    var result = {
                        user: key,
                        total: g.Sum(function (x) { return parseInt(x.num_changes) })
                    }
                    return result;
                })
            .OrderByDescending(function (x) {
                return parseInt(x.total);
            })
            .ToArray();
            
        result = result.filter(function(editor){
          return app.blacklist.indexOf(editor.user) === -1;
        });
        
        // limit the length of the leaderboard?
        // data.slice(0,15);

          //var columns = ['user','total'];
          //tabulate(result,columns);
          
          
          // construct panel tab buttons
        var editorsContainer = $('#top-editors'),
            panelContainer = $('<div class="tabs-content">'),
            rowsPerPanel = 10,
            panelCount = Math.ceil(result.length / rowsPerPanel);

        var editorsPanelTabs = $('<ul class="nav nav-tabs text-center">');
        for(var panelIdx = 1; panelIdx <= panelCount; panelIdx++){
          var tabButton = $('<li class="tab-title">'),
              tabButtonLink = $('<a href="#panel_leaderboard' + panelIdx + '" data-toggle="tab">' + panelIdx + '</a>');

          if(panelIdx === 1) tabButton.addClass('active');
          tabButton.append( tabButtonLink );
          editorsPanelTabs.append( tabButton );
        }

        panelContainer.appendTo(editorsContainer);
        editorsPanelTabs.appendTo(editorsContainer);

        // holy lord this is messy
        $.each(result, function(idx, editor){
          var panelNumber = Math.ceil(idx / rowsPerPanel);
          if(idx % rowsPerPanel === 0){
            // construct panels
            var panel = $('<div class="content" id="panel_leaderboard' + (panelNumber + 1) + '">');
            if(idx === 0) panel.addClass('active');
            app.addRowTo(panel, editor, idx + 1 );
            panel.appendTo( panelContainer );
          }else{
            // append to existing panel
            app.addRowTo( $('div#panel_leaderboard' + panelNumber), editor, idx + 1 );
          }
        });
        
        });      

    },

    addRowTo: function(panel, editor, rank){
      var row = $('<li class="top-editor clearfix">').appendTo( panel ),
          userNameLink = '<a href="http://www.openstreetmap.org/user/' + editor.user + '" target="_new">' + editor.user + '</a>';
      
      row.append( $('<span class="small-1 columns text-center">').text(rank) );    
      row.append( $('<span class="small-5 columns">').html(userNameLink) );
      row.append( $('<span class="small-2 columns text-right">').text(editor.total) );

    },

    });

})()