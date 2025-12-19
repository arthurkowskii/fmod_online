var FMOD = {};
FMOD.preRun = prerun;
FMOD.onRuntimeInitialized = main;
FMOD.INITIAL_MEMORY = 64 * 1024 * 1024;
FMODModule(FMOD);

var gSystem;
var gMusiqueInstance = null;
var gStatusElement;
var gInstrumentSelect;

function CHECK_RESULT(result) {
    if (result !== FMOD.OK) {
        var msg = "FMOD Error: " + FMOD.ErrorString(result);
        console.error(msg);
        gStatusElement.innerText = msg;
        return false;
    }
    return true;
}

function prerun() {
    gStatusElement = document.getElementById("status");
    var bankFiles = [
        "Master.bank",
        "Master.strings.bank"
    ];

    bankFiles.forEach(function(fileName) {
        FMOD.FS_createPreloadedFile("/", fileName, "banks/" + fileName, true, false);
    });
}

function main() {
    var outval = {};
    
    // Create Studio System
    if (!CHECK_RESULT(FMOD.Studio_System_Create(outval))) return;
    gSystem = outval.val;

    // Initialize System
    if (!CHECK_RESULT(gSystem.initialize(128, FMOD.STUDIO_INIT_NORMAL, FMOD.INIT_NORMAL, null))) return;

    gStatusElement.innerText = "FMOD Initialized. Loading Banks...";
    initApplication();
}

function initApplication() {
    var outval = {};

    // Load Banks
    if (!CHECK_RESULT(gSystem.loadBankFile("/Master.bank", FMOD.STUDIO_LOAD_BANK_NORMAL, outval))) return;
    if (!CHECK_RESULT(gSystem.loadBankFile("/Master.strings.bank", FMOD.STUDIO_LOAD_BANK_NORMAL, outval))) return;

    // Get Event
    var eventDescription = {};
    if (!CHECK_RESULT(gSystem.getEvent("event:/MUSIQUE", eventDescription))) {
        gStatusElement.innerText = "Error: Event 'event:/MUSIQUE' not found.";
        return;
    }

    // Create Instance
    if (!CHECK_RESULT(eventDescription.val.createInstance(outval))) return;
    gMusiqueInstance = outval.val;

    setupUI();
    
    gStatusElement.innerText = "Ready!";
    
    // Start update loop
    window.setInterval(update, 20);
}

function setupUI() {
    var btnPlay = document.getElementById("btn-play");
    var btnStop = document.getElementById("btn-stop");
    gInstrumentSelect = document.getElementById("instrument");

    btnPlay.disabled = false;
    btnStop.disabled = false;
    gInstrumentSelect.disabled = false;

    btnPlay.onclick = function() {
        if (gMusiqueInstance) {
            gMusiqueInstance.start();
            gStatusElement.innerText = "Playing...";
        }
    };

    btnStop.onclick = function() {
        if (gMusiqueInstance) {
            gMusiqueInstance.stop(FMOD.STUDIO_STOP_ALLOWFADEOUT);
            gStatusElement.innerText = "Stopped.";
        }
    };

    gInstrumentSelect.onchange = function() {
        var val = parseInt(this.value);
        if (gMusiqueInstance) {
            // "INSTRUMENT" is a labeled parameter
            // We set it by index (0 for TROMPETTES, 1 for GUITARE based on metadata)
            gMusiqueInstance.setParameterByName("INSTRUMENT", val, false);
        }
    };
}

function update() {
    if (gSystem) {
        gSystem.update();
    }
}
