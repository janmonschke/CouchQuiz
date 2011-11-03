window.questions = {
  republiksflucht : {
    title : "Was war 1958 die Strafe auf Republiksflucht?",
    answers : ["Todesstrafe", "Zuchthausstrafe", "Gefängnisstrafe", "Verwarnung"],
    correctAnswer : "Zuchthausstrafe"
  },
  gefluechtet : {
    title : "Wie viele Menschen sind 1958 aus dem Osten geflüchtet?",
    answers : ["2.000", "20.000", "200.000", "2.000.000"],
    correctAnswer : "200.000"
  },
  sperrzone : {
    title: "Wie wurde die Aktion genannt?",
    answers : ["Ungeziefer", "Weißer Rieße", "Kornblume", "Rose"],
    correctAnswer :  "Ungeziefer"
  },
  zeitung : {
    title: "Welche ist keine Ost-Zeitung?",
    answers : ["Junge Welt", "Neues Deutschland", "Berliner Morgenpost", "Berliner Zeitung"],
    correctAnswer :  "Berliner Morgenpost"
  },
  mark : {
    title: "Wie viele Ost-Mark musste Jenny ca. einwechseln, um den 3 West-Mark teuren Irish-Coffee zu kaufen?",
    answers : ["21", "150", "6", "57"],
    correctAnswer :  "21"
  },
  grenzverlauf : {
    title: "Welches ist der richtige Grenzverlauf?",
    answers : ["A", "B", "C", "D"],
    correctAnswer :  "C"
  },
  humboldt : {
    title: "Wo befindet sich die Humboldt-Universität?",
    answers : ["A", "B", "C", "D"],
    correctAnswer :  "B"
  },
  wonhung : {
    title: "Wo ungefähr wohnten Jenny und Robert?",
    answers : ["A", "B", "C", "D"],
    correctAnswer :  "D"
  },
  pfarrer : {
    title: "Wo wohnte ihr Pfarrer?",
    answers : ["A", "B", "C", "D"],
    correctAnswer :  "C"
  }
};

window.onload = function(){
  UI = {
    isAdmin : false,
    last_q_id : 0,
    teamName : "",
    questionsAndAnswers : [],
    
    getTeamName : function(){
      while(this.teamName == undefined || this.teamName == null || this.teamName.length <= 0)
        UI.teamName = prompt("Teamnamen eingeben:");
      return UI.teamName;
    },
    
    listenForQuestions : function(){
      var db = $.couch.db("couchquiz");
      var changes_handler = db.changes(0,{include_docs:true});
      changes_handler.onChange(function(q){
        if(q.results && q.results.length > 0 && q.results[0].doc.type == "question"){
          UI.addQuestion(q.results[0].doc);
        }
      });
    },
    
    addQuestion : function(q){      
      if(UI.questionsAndAnswers[q._id] == undefined){
        UI.last_q_id = q._id
        UI.questionsAndAnswers[q._id] = {};
        UI.questionsAndAnswers[q._id].question = q.title;
        UI.questionsAndAnswers[q._id].answers = [];
        UI.questionsAndAnswers[q._id].correctAnswer = q.correctAnswer;
        for(var i = 0; i < q.answers.length; i++)
          UI.questionsAndAnswers[q._id].answers[q.answers[i]] = {
            title : q.answers[i],
            value : 0
          }
      }
      if(!UI.isAdmin){
        UI.displayQuestion(q);
      }
    },
    
    displayQuestion : function(q){
      // Add View Logic here
      
      var clickHandler = function(){
        $(this).addClass("picked");
        UI.pushAnswer({"q_id" : UI.last_q_id, "value": $(this).text(), "teamName" : UI.getTeamName()});
        UI.disableAnswering();
      };
      
      var body = $(document.body).removeClass();
      body.html("");
      var question = $("<h1/>").attr("id","question").text(q.title);
      var answers = $("<ul/>").attr("id", "answers");
      var a1 = $("<li/>").append($("<div/>").text(q.answers[0]).click(clickHandler));
      var a2 = $("<li/>").append($("<div/>").text(q.answers[1]).click(clickHandler));
      var a3 = $("<li/>").append($("<div/>").text(q.answers[2]).click(clickHandler));
      var a4 = $("<li/>").append($("<div/>").text(q.answers[3]).click(clickHandler));
      answers.append(a1).append(a2).append(a3).append(a4);
      body.append(question);
      body.append(answers);
      console.log("remove me when UI for questions is done", q);
    },
    
    activateAdmin : function(){
      this.isAdmin = true;
      UI.listenForAnswers();
      // build admin view
      //console.log("remove me when UI admin is done");
    },
    
    listenForAnswers : function(){
      var db = $.couch.db("couchquiz");
      var changes_handler = db.changes(0,{include_docs:true});
      changes_handler.onChange(function(a){
        if(UI.isAdmin && a.results && a.results.length > 0 && a.results[0].doc.type == "answer"){
          UI.answerReceived(a);
        }
      });
    },
    
    answerReceived : function(a){
      UI.questionsAndAnswers[a.results[0].doc.q_id].answers[a.results[0].doc.value].value++;
      console.log("Answer by", a.results[0].doc.teamName, "correct?", a.results[0].doc.value == UI.questionsAndAnswers[a.results[0].doc.q_id].correctAnswer, a.results[0].doc.value, UI.questionsAndAnswers[a.results[0].doc.q_id].correctAnswer);
      var elem = $("[data-text="+a.results[0].doc.value+"]");
      var v = parseInt(elem.attr("data-votes"),10);
      elem.attr("data-votes", ++v);
      elem.width(elem.width() + 20);
    },
    
    
    /*
    {"title":"ss","answers":["aller","bester","test"]}
    */
    pushQuestion : function(q){
      if(!UI.isAdmin) return false;
      q.type = "question";
      console.log("Pushing a new question to the server", q);
      console.log("================================================================");
      var db = $.couch.db("couchquiz");
      db.saveDoc(q, {
        success : function(doc){
          UI.displayAdminQuestion(q);
        },
        error : function(){
          console.log("error creating answer");
        }
      });
    },
    
    displayAdminQuestion : function(q){
      $(document.body).html("").addClass("graph");
      $(document.body).append("<h1 id='question'>"+ q.title+"</h1>");
      var ul = $("<ul />").attr("id","graph");
      var g1 = $("<li/>").append($("<div/>").addClass("bar").attr("data-votes","0").attr("data-text", q.answers[0]));
      var g2 = $("<li/>").append($("<div/>").addClass("bar").attr("data-votes","0").attr("data-text", q.answers[1]));
      var g3 = $("<li/>").append($("<div/>").addClass("bar").attr("data-votes","0").attr("data-text", q.answers[2]));
      var g4 = $("<li/>").append($("<div/>").addClass("bar").attr("data-votes","0").attr("data-text", q.answers[3]));
      ul.append(g1).append(g2).append(g3).append(g4);
      $(document.body).append(ul);
      //console.log("build the admin UI that should also contain the currently answered amounts & stuff");
    },
    
    /* 
    {"q_id" : UI.last_q_id, "value":"test", "teamName" : UI.getTeamName()}
    */ 
    pushAnswer : function(a){
      a.type = "answer";
      UI.disableAnswering();
      console.log("Pushing a new answer to the server", a);
      var db = $.couch.db("couchquiz");
      db.saveDoc(a, {
        success : function(doc){
          
        },
        error : function(){

        }
      });
    },
    
    disableAnswering : function(){
      //console.log("the player has answered, disable the ui now");
      $("div").unbind();
      setTimeout(function(){
        UI.showBlank();
      }, 2000);
    },
    
    showBlank : function(){
      $(document.body).html("<div>Warte auf Frage...<div id='loader'></div></div>").addClass("fullscreen blank");
      var cl = new CanvasLoader('loader');
      cl.setColor('#999999'); // default is '#000000'
      cl.show(); // Hidden by default
    }
  };
  UI.getTeamName();
  UI.showBlank();
  UI.listenForQuestions();
  
  // for testing:
  // Server
  // UI.activateAdmin();
  // UI.pushQuestion({"title":"ss","answers":["aller","bester","test"]});
  // after that the Client
  // UI.pushAnswer({"q_id" : UI.last_q_id, "value":"test", "teamName" : UI.getTeamName()});
  
};