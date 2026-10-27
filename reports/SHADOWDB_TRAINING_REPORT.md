# ShadowDB Text-to-SQL Fine-Tuning & Evaluation Report

## 1. Model & Hardware Configuration
- **Base Model:** `unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`
- **Fine-Tuning Method:** 4-bit QLoRA (NF4 + Double Quantization)
- **LoRA Rank ($r$) / Alpha ($\alpha$):** 16 / 16
- **Trainable Parameters:** 40,370,176 / 7,655,986,688 (0.5273%)
- **Loss Strategy:** Response-Only Loss Masking (`train_on_responses_only`)
- **Export Format:** GGUF `Q4_K_M` (4.68 GB)
- **Model Download Link:** [Download Qwen2.5-Coder-7B-Instruct.Q4_K_M.gguf](https://drive.google.com/file/d/1GRxV7cIdVo3vaby-ZLVsBKwPBFMfKSPn/view?usp=sharing)
- **Peak GPU VRAM:** N/A GB
- **Total Training Duration:** N/A minutes

## 2. Convergence Metrics
| Metric | Value |
| :--- | :--- |
| **Initial Training Loss** | 0.5997 |
| **Final Training Loss** | 0.1729 |
| **Best Validation Loss** | 0.1708 (Step 300) |
| **Validation Perplexity ($PPL$)** | 1.1862 |

## 3. SQLite Sandbox Execution Benchmarks ($N = 100$)
| Evaluation Dimension | Score | Description |
| :--- | :--- | :--- |
| **AST Syntactic Validity Rate** | **80.0%** | Queries parsing cleanly without syntax errors |
| **Schema Execution Grounding** | **80.0%** | Queries executing against DDL schema without table/column errors |
| **Normalized Exact Match (EM)** | **27.0%** | Queries matching ground truth SQL token-for-token |

## 4. SQL Clause Recall
| SQL Clause | Accuracy (%) |
| :--- | :--- |
| `SELECT` | 97.7% |
| `FROM` | 97.9% |
| `WHERE` | 98.7% |
| `JOIN` | 60.0% |
| `GROUP BY` | 71.1% |
| `ORDER BY` | 81.8% |
| `HAVING` | 40.0% |
| `LIMIT` | 100.0% |