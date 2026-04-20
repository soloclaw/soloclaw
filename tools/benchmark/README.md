# Model Benchmark

Compares Ollama models across mathematics, physics, philosophy, and coding domains.

## Usage

```bash
# Benchmark all SoloClaw presets (small/medium/large)
python3 tools/benchmark/benchmark.py

# Benchmark specific sizes
python3 tools/benchmark/benchmark.py --presets small
python3 tools/benchmark/benchmark.py --presets small medium

# Benchmark arbitrary models
python3 tools/benchmark/benchmark.py --models qwen3:8b gemma4:e2b qwen2.5:14b

# Custom output path
python3 tools/benchmark/benchmark.py --output my-results.json
```

## Requirements

- Python 3.9+
- Ollama running locally (`http://127.0.0.1:11434`)
- No pip packages needed (uses stdlib only)

## Model Presets

| Preset | Model | RAM |
|--------|-------|-----|
| small | qwen3:8b | 8GB |
| medium | mistral-small:24b | 16GB |
| large | qwen3:32b | 32GB |

## Scoring

Each question has 2-4 keyword groups. A group matches if any term appears (case-insensitive). Accuracy = matched groups / total groups.

## Output

Results are saved to `tools/benchmark/results.json` with per-model domain scores, overall ranking, and recommendations.
