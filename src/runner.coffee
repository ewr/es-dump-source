debug   = require("debug")("es-dump-source")
ES      = require "elasticsearch"
tz      = require "timezone"

ScrollSearch = require "./scroll-search"
Writer = require "./writer"

argv = require("yargs")
    .options
        server:
            describe:       "Elasticsearch Server"
            demand:         true
            requiresArg:    true
        start:
            describe:       "Start Date"
            demand:         true
            requiresArg:    true
        end:
            describe:       "End Date"
            demand:         true
            requiresArg:    true
        zone:
            describe:       "Timezone for dates"
            default:        "UTC"
        prefix:
            describe:       "ES Index Prefix"
            demand:         true
            requiresArg:    true
        timestring:
            describe:       "Date Format"
            default:        "%Y.%m.%d"
        sorted:
            describe:       "Sort Output?"
            default:        false
            boolean:        true
    .argv

if argv.zone != "UTC"
    zone = tz(require("timezone/#{argv.zone}"))
else
    zone = tz

es = new ES.Client host:argv.server

start_date  = zone(argv.start,argv.zone)
end_date    = zone(argv.end,argv.zone)

console.error "Stats: #{ start_date } - #{ end_date }"

# -- Build our Query -- #

query = if argv.filter
    filtered:
        query:
            match_all: {}
        filter: JSON.parse(argv.filter)
else
    match_all: {}

body =
    query:  query
    size:   argv.batch

debug "ES body is ", JSON.stringify(body)

# -- Build an array of indices -- #

indices = []

ts = start_date

loop
    idx = argv.prefix + zone(ts,argv.timestring)
    debug "Prep: index #{idx}"
    indices.push idx
    ts = tz(ts,"+1 day")
    break if ts >= end_date

debug "Found #{ indices.length } indices."

# -- Run -- #

writer = new Writer
writer.pipe(process.stdout)

runIndex = (cb) ->
    idx = indices.shift()

    debug "Running #{idx}"

    if !idx
        # we're all done
        cb()

    search = new ScrollSearch es, idx, body

    search.pipe(writer, end:false)

    search.once "end", ->
        debug "Got search end."
        runIndex cb

runIndex ->
    debug "Done with indices"
    writer.end()
