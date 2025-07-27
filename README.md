# Smart Traffic Violation Detector

A fully serverless application that spots traffic violations on uploaded CCTV frames using AWS Rekognition.

## Stack
| Layer      | Service(s)                               |
|------------|------------------------------------------|
| Frontend   | HTML + CSS + JS (Bootstrap) — Amplify/S3 |
| Backend    | AWS Lambda (Python 3.12)                 |
| AI / ML    | Rekognition (labels + text)              |
| Data       | DynamoDB (PAY_PER_REQUEST)               |
| Storage    | S3 (evidence images)                     |
| Monitoring | CloudWatch dashboard                     |

## Quick Start
1. **Deploy infra**: `cloudformation/template.yaml` (or create bucket & DDB manually).  
2. **Build Lambda ZIP** from `backend/lambda/analyze_image` (include helpers).  
3. **API Gateway HTTP API** → route `POST /analyze` → Lambda.  
4. **Lambda env var**: `UPLOAD_BUCKET=smart-traffic-uploads`.  
5. **Frontend**: edit `amplify-frontend/script.js` → set `API_ENDPOINT` to the invoke URL.  
6. **Host frontend** via Amplify console (or S3 + CloudFront).

## Violation Logic
`app.py` uses simple rule‑based checks. Add OpenCV, custom ML, or OpenALPR if you need advanced license‑plate or speed detection.

## Free‑Tier Tips
- Keep images small (< 500 KB) to stay inside API Gateway limits.  
- Use 512 MB Lambda memory; enable Graviton2 for 20‑30 % cheaper execution.  
- DynamoDB PAY_PER_REQUEST avoids unused capacity costs.
