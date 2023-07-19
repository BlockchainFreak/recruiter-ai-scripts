import http from 'http'
import fs, { readFileSync } from 'fs'
import path from 'path'

const Link = (link: string, path: string) => 
`<a class="p-2 rounded-md hover:bg-blue-500 ${link.includes(path) ? "bg-blue-700" : "bg-zinc-400"}" 
href="/${link.replace(".json","")}"><div>
    ${link.replace(".json","")}
</div></a>`

const category = "gaper"

const inputDir = path.join("inputs", category)
const outputDir = path.join("outputs", category)

const inputFileList = fs.readdirSync(inputDir)
const inputfilePaths = inputFileList.map(fn => path.join(inputDir, fn))
const outputFileList = fs.readdirSync(outputDir)
const outputfilePaths = outputFileList.map(fn => path.join(outputDir, fn))

const server = http.createServer((req, res) => {

    const template = fs.readFileSync("server/template.html", "utf8").replace("{{replace}}", JSON.stringify({ inputFileList, outputFileList }, null, 4))

    console.log(req.url)

    if (req.url?.startsWith("/pdf")) {
        const fn = decodeURIComponent(req.url.split("/").slice(-1)[0])
        const test = readFileSync(`inputs/${category}/${fn}.pdf`)
        res.writeHead(200, { 'Content-Type': "application/pdf" });
        res.end(test, "binary");
        return;
    }

    const fn = req.url === "/" ? outputFileList[0].replace(".json", "") : decodeURIComponent(req.url?.substring(1) ?? "");
    console.log("fn",fn)
    const outputJson = fs.readFileSync(`outputs/${category}/${fn}.json`, "utf8")

    const htmlfile = template
        .replace("{{links}}", outputFileList.map(link => Link(link, fn)).join("\n"))
        .replace("{{output}}", `<pre><p>${outputJson.replace("\n", "</p><p>")}</p></pre>`)
        .replace("{{pdfFile}}", fn.replace(".json", ""))

    console.log(req.url)
    res.writeHead(200, { 'Content-Type': "text/html" });
    res.end(htmlfile);
    return;
})

server.listen(4000, () => {
    console.log("Server running on port 4000")
})