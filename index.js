var restify = require('restify');
var server = restify.createServer();
// Load the Mongoose module and Schema object
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PORT = process.env.PORT;
var ipaddress = process.env.IP;

var uristring = process.env.MONGODB_URI || 'mongodb://localhost:27017/PatientClinicalDatabase';

mongoose.connect(uristring, function(err, res){
    if (err){
        console.log('ERROR connecting to: ' + uristring + ', ' + err);
    }else{
        console.log ('Succeeded connected to: ' + uristring);
    }
});

server.use(restify.plugins.bodyParser({ mapParams: false }));

server.listen(PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
  console.log('Endpoints:');
  console.log('%s/patients method: GET, POST', server.url);
  console.log('%s/patients/:id method: PUT, GET', server.url);
  console.log('%s/patients/:id/:isCritical method:PUT', server.url);
  console.log('%s/records method: GET, POST', server.url);
  console.log('%s/records/:id method: PUT', server.url);
});

// GET request for patients
server.get('/patients', getPatients);

//GET request for patient by id
server.get('/patients/:id', findPatientById);

// POST request for patients
server.post('/patients', addNewPatient);

// PUT request for patients
server.put('/patients/:id', editPatient);

//GET request for patient records
server.get('/records', getPatientRecords);

//POST request for patient records
server.post('/records', addNewRecord);

//PUT request for patient records
server.put('/records/:id', editPatientRecord);

//Flag critical patients
server.put('/patients/:id/:isCritical', flagCriticalPatient);


// Define a new 'PatientSchema'
var PatientSchema = new Schema({
    "first_name": String, 
    "last_name": String, 
    "age": Number,
    "date_of_birth": Date,
    "sin": String, 
    "address": String, 
    "emergency_contact_name": String, 
    "emergency_contact_number": String, 
    "admission_date": Date, 
    "in_critical_condition": Boolean
});

var PatientRecordSchema = new Schema({
    "patient_id": String,
    "date": Date,
    "data_type":{
        type: String,
        enum: ['Blood Pressure', 'Respiratory Rate', 'Blood Oxygen Level', 'Heart Beat Rate'],
        default: 'NEW'
    },
    "reading1": String,
    "reading2":String
});


// Create the 'Patient' model out of the 'PatientSchema'
var Patient = mongoose.model('Patient', PatientSchema);
var Record = mongoose.model('PatientRecords', PatientRecordSchema);

function getPatients(req, res, next){
    Patient.find({}, function (err, patients) {
        if (err) {
            return next(err);
        } else {
            res.json(patients);
        }
    });
}

function getPatientRecords(req, res, next){
    Record.find({}, function (err, records) {
        if (err) {
            return next(err);
        } else {
            res.json(records);
        }
    });
}

function addNewPatient(req, res, next) {
    var newPatient = new Patient(req.body);
    // Use the 'Patient' instance's 'save' method to save a new patient information
    newPatient.save(function (err) {
        if (err) {
            // Call the next middleware with an error message
            return next(err);
        } else {
            // Use the 'response' object to send a JSON response
            res.json(newPatient);
        }
    });
}

function addNewRecord(req, res, next) {
    var newRecord = new Record(req.body);
    // Use the 'Patient' instance's 'save' method to save a new patient information
    newRecord.save(function (err) {
        if (err) {
            // Call the next middleware with an error message
            return next(err);
        } else {
            // Use the 'response' object to send a JSON response
            res.json(newRecord);
        }
    });
}

function editPatient(req, res, next) {
    Patient.findByIdAndUpdate( req.params.id, req.body, function (err) {
        if (err) {
            return next(err);
        } else {
            res.json(req.body);
        }
    });
}

function editPatientRecord(req, res, next) {
    Record.findByIdAndUpdate( req.params.id, req.body, function (err) {
        if (err) {
            return next(err);
        } else {
            res.json(req.body);
        }
    });
}

function flagCriticalPatient(req, res, next) {
    Patient.findByIdAndUpdate( req.params.id, {"in_critical_condition": req.params.isCritical}, function (err) {
        if (err) {
            return next(err);
        } else {
            res.json(req.body);
        }
    });
}

function findPatientById(req, res, next) {
    Patient.findById( req.params.id, function (err, patients) {
        if (err) {
            return next(err);
        } else {
            res.json(patients);
        }
    });
}

