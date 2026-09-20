# Mhamed Askoure

**Python AI Developer focused on reliable LLM/API workflows.**

I build and harden the layer between AI model responses and production Python code — especially when malformed JSON, schema drift, wrong field types, missing fields, or API failures can break the next step.

## What I work on

- Python + FastAPI debugging
- LLM API integrations
- Structured JSON / structured output reliability
- Pydantic v2 and JSON Schema validation
- Explicit failure handling and bounded retry logic
- REST API data validation
- Regression testing with pytest
- Docker / AWS Lambda packaging when appropriate

## Featured public proof

### [LLM Reliability Rescue](https://github.com/zongsm-cmyk/llm-reliability-rescue-demo)

[![CI](https://github.com/zongsm-cmyk/llm-reliability-rescue-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/zongsm-cmyk/llm-reliability-rescue-demo/actions/workflows/ci.yml)

A self-built public engineering proof for one of the most common LLM integration problems: **unreliable structured output**.

It currently demonstrates:

- safe JSON extraction without `eval` or fabricated repair
- strict Pydantic v2 validation
- explicit structured error states
- FastAPI endpoints
- Docker support
- AWS Lambda deployment
- **11/11 public regression tests passing**

**Live API docs:**  
https://7hjfrxuwyxgke2h7fqhaubykda0benzq.lambda-url.us-east-1.on.aws/docs

This repository is a code sample and engineering proof. It is not presented as prior paid-client work.

## How I approach rescue work

1. Reproduce one concrete failing step.
2. Define the expected output contract.
3. Add the smallest reliable fix.
4. Make failures explicit instead of silently inventing data.
5. Lock the behavior with focused regression tests.
6. Deliver clean source changes plus a concise explanation.

## Current fixed-scope offer

For a small Python / LLM / API reliability issue, I can start with one bounded failing step:

- reproduce the failure
- add safe parsing and validation
- improve failure handling
- add a focused regression test
- return a clean patch and explanation

A redacted failing payload, expected schema, relevant code, and deadline are usually enough to scope the first pass.

## Work with me

- **Upwork:** https://www.upwork.com/freelancers/~01f95546c501a4254e
- **Fiverr:** https://www.fiverr.com/mhamedaskoure

---

**Current focus:** Python · FastAPI · Pydantic · LLM APIs · Structured JSON · API Reliability · pytest · Docker · AWS Lambda
