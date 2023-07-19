# JD Processor

## to parse JDs
```bash
pnpm jd
```

## to check the results in a split screen

```bash
pnpm start
```

This will start a server that listens on `localhost:4000` by default unless the port is changed.

## Directory structure

### PDF JDs

**Path:** `inputs/{{CATEGORY}}/{{filename}}.pdf`
- inputs
    - gaper
        - jd1.pdf
        - jd2.pdf

### JSON Outputs

**Path:** `outputs/{{CATEGORY}}/{{filename}}.json`
- outputs
    - gaper
        - jd1.json
        - jd2.json