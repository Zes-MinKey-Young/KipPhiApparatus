local p = {}
local navbar = require("Module:navbar")._navbar

---@enum SoftwareType
local softwareTypes = {
    "editor",
    "community",
    "player",
    "renderer",
    editor = 1,
    community = 2,
    player = 3,
    renderer = 4
}
---@class Software
---@field name string
---@field type SoftwareType
---@field abbr string
---@field icon ?string

---@type Software[]
local softwares = {
    {
        name = "Re:PhiEdit",
        type = softwareTypes.editor,
        abbr = "RPE",
        icon = "Rpelogo.png"
    },
    {
        name = "PhiEditer",
        type = softwareTypes.editor,
        abbr = "PE"
    },
    {
        name = "奇谱发生器",
        type = softwareTypes.editor,
        abbr = "KPA",
        icon = "奇谱发生器.svg"
    },
    {
        name = "Phichain",
        type = softwareTypes.editor,
        abbr = "PC"
    },
    {
        name = "Phira",
        type = softwareTypes.community,
        abbr = "PR",
        icon = "Phira icon.png"
    },
    {
        name = "PhiZone",
        type = softwareTypes.community,
        abbr = "PZ",
        icon = "PhiZone Logo.png"
    },
    {
        name = "Phigrim",
        type = softwareTypes.community,
        abbr = "PG",
        icon = "Phigrim logo.webp"
    },
    {
        name = "Half Step Project",
        type = softwareTypes.community,
        abbr = "HSP",
        icon = "HSP Logo.png"
    },
    {
        name = "Phigros Simulator",
        type = softwareTypes.player,
        abbr = "SP"
    },
    {
        name = "RE:Phigros",
        type = softwareTypes.player,
        abbr = "REP",
        icon = "REPhigros Logo.png"
    },
    {
        name = "Phispler",
        type = softwareTypes.player,
        abbr = "PS"
    },
    {
        name = "RPE Recorder",
        type = softwareTypes.renderer,
        abbr = "RPER"
    },
    {
    	name = "PhiRecorder",
    	type = softwareTypes.renderer,
    	abbr = "PRER"
    }
}

---@param types {[SoftwareType]: true}
---@return Software[]
local function exclude(types)
    local t = {}
    for _, software in ipairs(softwares) do
        if not types[software.type] then
            table.insert(t, software)
        end
    end
    return t
end

local function generateAvailabilityIcon(support)
    local name;
    support = string.lower(support)
    if support == "yes" then
        name = "Checkicon.png"
    elseif support == "no" then
        name = "Crossicon.png"
    elseif support == "partial" then
        name = "Partialicon.png"
    elseif support == "unknown" then
        name = "Unknownicon.png"
    else
        return ""
    end
    return string.format(
        "[[File:%s|32px]]",
        name
    )
end


--- @alias SoftwareName string
--- @alias CompatibilityName string
--- @alias CompatibilityEntity {version?: string, support: string, note?: string}
--- @alias Compatibility {[SoftwareName]: CompatibilityEntity[] | CompatibilityEntity}
--- @alias CompatibilityTable {[CompatibilityName]: Compatibility}
--- @alias CompatibilityModule {features: CompatibilityTable, types: {[SoftwareType]: true}}

--- @param data CompatibilityModule
function p.table(data, tname, frame)
    local frame = frame or mw.getCurrentFrame()
    local types = data.types or {}
    local includedSoftwares = exclude(types)

    local root = mw.html.create("table"):addClass("compatibility-table")
    local firstRow = root:tag("tr")
    firstRow
        :tag("td")
        :attr("colspan", #includedSoftwares + 1)
        :wikitext(tostring(navbar({title="Module:Compatibility table/" .. tname})))

    local tr = root:tag("tr")
    tr:tag("th"):wikitext("Features")
    for _, software in ipairs(includedSoftwares) do
        tr
            :tag("th")
            :wikitext(software.icon and string.format("[[File:%s|32px]] ", software.icon) or "")
            :tag("abbr")
                :wikitext(software.abbr)
    end
    for i, name in ipairs(data.features) do
        local compatibility = data.features[name]
        local tr = root:tag("tr")
        tr:tag("td"):wikitext(name)
        for _, software in ipairs(includedSoftwares) do
            local td = tr:tag("td")
            local entities = compatibility[software.abbr]
            if entities then
                if type(entities) == "string" then
                    entities = {support=entities}
                end
                if not entities[1] and entities.support then
                    entities = {entities}
                end
                for _, entity in ipairs(entities) do
                    if entity.version then
                        td:wikitext(entity.version)
                    end
                    td
                        :tag("span")
                        :wikitext(generateAvailabilityIcon(entity.support))
                        :addClass("compatibility-" .. entity.support)
                    if entity.note then
                        td:wikitext(frame:extensionTag{name="ref", content=entity.note})
                    end
                    td:wikitext("<br>")
                end
            else 
                td:tag("span")
                  :wikitext(generateAvailabilityIcon("Unknown"))
                  :addClass("compatibility-unknown")
                
            end
        end
    end
    return root
end

function p._main(name, frame) 
    return p.table(mw.loadData("Module:Compatibility table/" .. name), name, frame)
end

function p.main(frame)
    local args = frame.args;
    return p._main(args[1], frame)
end

return p
