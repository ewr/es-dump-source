var ES, ScrollSearch, Writer, argv, body, debug, end_date, es, idx, indices, query, runIndex, start_date, ts, tz, writer, zone;

debug = require("debug")("es-dump-source");

ES = require("elasticsearch");

tz = require("timezone");

ScrollSearch = require("./scroll-search");

Writer = require("./writer");

argv = require("yargs").options({
  server: {
    describe: "Elasticsearch Server",
    demand: true,
    requiresArg: true
  },
  start: {
    describe: "Start Date",
    demand: true,
    requiresArg: true
  },
  end: {
    describe: "End Date",
    demand: true,
    requiresArg: true
  },
  zone: {
    describe: "Timezone for dates",
    "default": "UTC"
  },
  prefix: {
    describe: "ES Index Prefix",
    demand: true,
    requiresArg: true
  },
  timestring: {
    describe: "Date Format",
    "default": "%Y.%m.%d"
  },
  sorted: {
    describe: "Sort Output?",
    "default": false,
    boolean: true
  }
}).argv;

if (argv.zone !== "UTC") {
  zone = tz(require("timezone/" + argv.zone));
} else {
  zone = tz;
}

es = new ES.Client({
  host: argv.server
});

start_date = zone(argv.start, argv.zone);

end_date = zone(argv.end, argv.zone);

console.error("Stats: " + start_date + " - " + end_date);

query = argv.filter ? {
  filtered: {
    query: {
      match_all: {}
    },
    filter: JSON.parse(argv.filter)
  }
} : {
  match_all: {}
};

body = {
  query: query,
  size: argv.batch
};

debug("ES body is ", JSON.stringify(body));

indices = [];

ts = start_date;

while (true) {
  idx = argv.prefix + zone(ts, argv.timestring);
  debug("Prep: index " + idx);
  indices.push(idx);
  ts = tz(ts, "+1 day");
  if (ts >= end_date) {
    break;
  }
}

debug("Found " + indices.length + " indices.");

writer = new Writer;

writer.pipe(process.stdout);

runIndex = function(cb) {
  var search;
  idx = indices.shift();
  debug("Running " + idx);
  if (!idx) {
    cb();
  }
  search = new ScrollSearch(es, idx, body);
  search.pipe(writer, {
    end: false
  });
  return search.once("end", function() {
    debug("Got search end.");
    return runIndex(cb);
  });
};

runIndex(function() {
  debug("Done with indices");
  return writer.end();
});

//# sourceMappingURL=runner.js.map
