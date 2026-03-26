import json
import os
import sys
import urllib.request
import urllib.error

# languages to download and their source URLs
# the Hermit Dave FrequencyWords repo provides 50k word lists
# derived from OpenSubtitles data, supports lots of languages!!!
# repo: https://github.com/hermitdave/FrequencyWords
# 7501 - because I want 7500 but am too lazy to check for off-by-one errors...
# don't want 7499, want 7500, so am doing 7501
# why not more you ask?
# It's a good question.
LANGUAGES = {
    "en": {
        "name": "English",
        "url": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt",
        "max_words": 7501
    },
    "fr": {
        "name": "French",
        "url": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/fr/fr_50k.txt",
        "max_words": 7501
    },
    "de": {
        "name": "German",
        "url": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt",
        "max_words": 7501
    },
    "es": {
        "name": "Spanish",
        "url": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt",
        "max_words": 7501
    },
    "pt": {
        "name": "Portuguese",
        "url": "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt/pt_50k.txt",
        "max_words": 7501
    }
}

OUTPUT_DIR = os.path.join("public", "words")
MIN_WORD_LENGTH = 2


def download(url):
    req = urllib.request.Request(
        url, headers={"User-Agent": "MarkTwain-WordListBuilder/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.URLError as e:
        print(f"  ERROR: could not download {url}: {e}")
        return None


def parse_word_list(raw_text, max_words):
    words = []
    seen = set()
    for line in raw_text.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        # format: word space count (or word tab count)
        parts = line.split()
        if len(parts) < 2:
            continue
        word = parts[0].lower().strip()
        if len(word) < MIN_WORD_LENGTH:
            continue
        if not word.isalpha():
            continue
        if word in seen:
            continue
        seen.add(word)
        words.append(word)
        if len(words) >= max_words:
            break
    return words


def build_manifest(results):
    manifest = {}
    for code, data in results.items():
        manifest[code] = {
            "name": LANGUAGES[code]["name"],
            "file": f"{code}.json",
            "count": data["count"]
        }
    return manifest


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    results = {}
    errors = []

    for code, config in LANGUAGES.items():
        print(f"Processing {config['name']} ({code})...")
        raw = download(config["url"])
        if raw is None:
            errors.append(code)
            continue

        words = parse_word_list(raw, config["max_words"])
        if len(words) == 0:
            print(f"  WARNING: no valid words parsed for {code}")
            errors.append(code)
            continue

        output_path = os.path.join(OUTPUT_DIR, f"{code}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False)

        results[code] = {"count": len(words)}
        print(f"  wrote {len(words)} words to {output_path}")

    # write a manifest file so the frontend knows what is available
    manifest = build_manifest(results)
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Wrote manifest to {manifest_path}")

    if errors:
        print(f"WARNING: failed languages: {', '.join(errors)}")
        sys.exit(1)
    else:
        print(f"Done. {len(results)} languages processed successfully.")


if __name__ == "__main__":
    main()
