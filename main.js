
(function(){

    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    };
    
    var db;
    var dbname = 'tasks';

    openDatabase(function() {
        console.log('db connected!');
        getTask();
    });
    
    function openDatabase(callback){
        var version =   1;
        var request =   indexedDB.open(dbname, version);
        request.onupgradeneeded = function(e) {
            db = e.target.result;
            e.target.transaction.onerror = databaseError;
            db.createObjectStore('task', { keyPath: 'timeStamp' });
        };

        request.onsuccess   =   function(e) {
            db  =   e.target.result;
            callback();
        };

        request.onerror =   databaseError;
    }

    function databaseError(e) {
        console.error('IndexedDB error:', e);
    }

    function addTask( text, callback ){
        var transaction =   db.transaction(['task'], 'readwrite');
        var store       =   transaction.objectStore('task');
        var request     =   store.put({
            text: text,
            timeStamp: Date.now(),
            isdone: false
        });

        transaction.oncomplete  =   function(e) {
            callback();
        };

        request.onerror =   databaseError;
    }

    function getTask() {
        var transaction = db.transaction(['task'], 'readonly');
        var store = transaction.objectStore('task');

        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        var data = [];
        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            // If there's data, add it to array
            if (result) {
                data.push(result.value);
                result.continue();

            // Reach the end of the data
            } else {
                var html    = '';
                data.forEach(function(eachdata){
                    html += `<li>
                        <span for="checkbox_${eachdata.timeStamp}">${eachdata.text}</span>
                        <input type="radio" class="checkbox" id="checkbox_${eachdata.timeStamp}" value="${eachdata.timeStamp}">
                    </li>`;
                });

                if ( html == '' ) {
                    html = '<p>Done with all tasks!</p>';
                }
        
                var appendField = document.querySelector('#task');
                appendField.innerHTML = html;


                var checkboxes  =   document.querySelectorAll("#task input");
                for (const _checkbox of checkboxes) {
                    _checkbox.addEventListener('change', function(e) {
                        if ( e.target.checked === true ) {
                            deleteTask(e.target.value);
                        }
                    });
                }
            }
        };
    }

    function deleteTask(index) {
        var transaction = db.transaction(["task"], "readwrite");
        var objectStore = transaction.objectStore("task");

        var objectStoreRequest = objectStore.delete(parseInt(index));

        objectStoreRequest.onsuccess = function(event) {
            // report the success of our request
            getTask();
        };
    }

    var taskfield   =   document.getElementById('task_input');
    taskfield.addEventListener('keydown', function(e){
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13'){
            addTask(
                taskfield.value,
                function(){
                    taskfield.value = '';
                    getTask();
                }
            );
            return false;
        }
    });
})();


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const background = $("body");
const tabs = $$(".tab-item");
const timers = $$(".timer");
const timer_btn = $(".timer-button");

tabs.forEach((tab, index) => {
    const timer = timers[index];

    tab.onclick = function () {
        
        $(".tab-item.active").classList.remove("active");
        $(".timer.active").classList.remove("active");
    
        this.classList.add("active");
        timer.classList.add("active");

        var killId = setTimeout(function() {
            for (var i = killId; i > 0; i--) 
                clearInterval(i)
        }, 10);

        timer_btn.classList.remove("stop");
        timer_btn.innerText = "START";

        switch(index){
            case 0: 
                timer.innerText = "25:00"
                background.classList.replace("rest","working");
                break;
            case 1: 
                timer.innerText = "05:00"
                background.classList.replace("working","rest");
                break;
        } 
    };
});


timer_btn.addEventListener('click', function(e){
    console.log("Clicked")
    var time = document.querySelector(".timer.active").innerText.split(":");
    var now = new Date().getTime();
    var defaultTime = parseInt(time[0]) * 60000 + parseInt(time[1]) * 1000
    var countDownTime = defaultTime + now;

    console.log(countDownTime)
    var currentTimer = document.querySelector(".timer.active")

    if(!timer_btn.classList.contains("stop")){
        timer_btn.classList.add("stop")
        timer_btn.innerText = "STOP";
        // Update the count down every 1 second
        var x = setInterval(function() {
            // Get today's date and time
            var now = new Date().getTime();
            
            // Find the distance between now and the count down date
            var distance = countDownTime - now;
            
            // Time calculations for days, hours, minutes and seconds
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
            var seconds = Math.floor((distance % (1000 * 60)) / 1000).toString();
            
            // Output the result in an element with id="demo"
            currentTimer.innerHTML = minutes.padStart(2, '0') + ":" + seconds.padStart(2, '0');

            // If the count down is over, write some text 
            if (distance < 0) {
                clearInterval(x);
                // Time calculations for days, hours, minutes and seconds
                var minutes = Math.floor((defaultTime % (1000 * 60 * 60)) / (1000 * 60)).toString();
                var seconds = Math.floor((defaultTime % (1000 * 60)) / 1000).toString();
                
                // Output the result in an element with id="demo"
                currentTimer.innerHTML = minutes.padStart(2, '0') + ":" + seconds.padStart(2, '0');

                timer_btn.classList.remove("stop")
                timer_btn.innerText = "START";
            }
        }, 1000);
    }else {
        var killId = setTimeout(function() {
            for (var i = killId; i > 0; i--) 
                clearInterval(i)
        }, 10);
        timer_btn.classList.remove("stop")
        timer_btn.innerText = "START";
    }

})