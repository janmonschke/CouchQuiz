$(function(){
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
      console.log("add q",q);
      if(UI.questionsAndAnswers[q._id] == undefined){
        UI.last_q_id = q._id
        UI.questionsAndAnswers[q._id] = {};
        UI.questionsAndAnswers[q._id].question = q.title;
        UI.questionsAndAnswers[q._id].answers = [];
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
      alert("test");
      console.log("remove me when UI for questions is done", q);
    },
    
    activateAdmin : function(){
      this.isAdmin = true;
      UI.listenForAnswers();
      // build admin view
      console.log("remove me when UI admin is done");
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
      console.log("received an answer, so update the UI", a);
    },
    
    
    /*
    {"title":"ss","answers":["aller","bester","test"]}
    */
    pushQuestion : function(q){
      if(!UI.isAdmin) return false;
      q.type = "question";
      console.log("Pushing a new question to the server", q);
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
      console.log("build the admin UI that should also contain the currently answered amounts & stuff");
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
      console.log("the player has answered, disable the ui now");
    }
  };
  UI.getTeamName();
  UI.listenForQuestions();
  
  // for testing:
  // Server
  // UI.activateAdmin();
  // UI.pushQuestion({"title":"ss","answers":["aller","bester","test"]});
  // after that the Client
  // UI.pushAnswer({"q_id" : UI.last_q_id, "value":"test", "teamName" : UI.getTeamName()});
  
});