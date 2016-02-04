module.exports = class Writer extends require("stream").Transform
    constructor: ->
        super

        @_writableState.objectMode      = true
        @_readableState.objectMode      = false
        @_writableState.highWaterMark   = 1024

    _transform: (obj,encoding,cb) ->
        if obj?._source?.message
            @push obj?._source?.message + "\n"

        cb()

