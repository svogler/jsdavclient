var client = new davlib.DavClient();
client.initialize(location.hostname, 443, 'https', 'user', 'password');


function writeToDiv(line, emphasize) {
    var div = document.getElementById('testdiv');
    var textnode = document.createTextNode(line);
    var newdiv = document.createElement('div');
    newdiv.appendChild(textnode);
    if (emphasize) {
        newdiv.style.color = 'red';
    } else {
        newdiv.style.color = 'blue';
    };
    div.appendChild(newdiv);
};

function assert(statement, debugprint) {
    if (!statement) {
        writeToDiv('FAILURE: ' + debugprint, 1);
    } else {
        writeToDiv('success');
    };
};

// since the lib is async I wrote the functions in the order
// they are executed to give a bit of an overview
function runTests() {
    testMakeDir();
};

function wrapContinueHandler(currname, handler, expected_status) {
    var wrapped = function(status, statusstr, content) {
        writeToDiv('status: ' + status + ' (' + statusstr + ')');
        if (content.locktoken) {
            window.LAST_LOCKTOKEN = content.locktoken;
        };
        if (content) {
            if (content.properties) {
                content = content.properties['foo:'] ? 
                          content.properties['foo:']['foo'].toXML() : 
                          'no property foo:foo';
            } else if (content.toSource) {
                content = content.toSource();
            };
            writeToDiv('content: ' + content);
        };
        writeToDiv('Expected status: ' + expected_status);
        if (status == expected_status) {
            writeToDiv('OK!');
        } else {
            writeToDiv('NOT OK!!');
        };
        writeToDiv('--------------------');
        handler();
    };
    return wrapped;
};

var basedir = '/on/demandware.servlet/webdav/Sites/Cartridges/version2/';
var folder1 = 'foo/';
var folder2 = 'bar/';
var file = 'bar.txt'

function testMakeDir() {
    writeToDiv('Going to create dir ' + basedir + folder1);
    client.MKCOL(basedir + folder1,
                wrapContinueHandler('make dir', testMove, 201));
};

function testMove() {
    writeToDiv('Going to move ' + basedir + folder1 + ' to ' + basedir + folder2);
    client.MOVE(basedir + folder1, basedir + folder2,
                wrapContinueHandler('move dir', testCopy, 201));
};

function testCopy() {
    writeToDiv('Going to copy ' + basedir + folder2 + ' to ' + basedir + folder1);
    client.COPY(basedir + folder2, basedir + folder1,
                wrapContinueHandler('copy dir', testDeleteDir, 201));
};

function testDeleteDir() {
    writeToDiv('Going to delete dir ' + basedir + folder2);
    client.DELETE(basedir + folder2,
                  wrapContinueHandler('delete dir', testReadFile1, 204));
};

function testReadFile1() {
    writeToDiv('Going to read file ' + basedir + folder1 + file);
    client.GET(basedir + folder1 + file,
               wrapContinueHandler('read file', testWriteFile1, 404));
};

function testWriteFile1() {
    writeToDiv('Going to create file ' + basedir + folder1 + file);
    client.PUT(basedir + folder1 + file, 'foo', 
               wrapContinueHandler('create file', testReadFile2, 201));
};

function testReadFile2() {
    writeToDiv('Going to read file ' + basedir + folder1 + file);
    client.GET(basedir + folder1 + file,
               wrapContinueHandler('read file', testReadDir, 200));
};

function testReadDir() {
    writeToDiv('Going to read directory ' + basedir + folder1);
    client.GET(basedir + folder1,
               wrapContinueHandler('read file', testDelete, 200));
};

function testDelete() {
    writeToDiv('Going to delete file ' + basedir + folder1 + file);
    client.DELETE(basedir + folder1 + file, 
                  wrapContinueHandler('delete dir', testDelete2, 204));
};

function testDelete2() {
    writeToDiv('Going to delete dir ' + basedir + folder1);
    client.DELETE(basedir + folder1,
                  wrapContinueHandler('delete dir', finish, 204));
};

function finish() {
    writeToDiv('Finished');
};

