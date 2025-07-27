import os, json, base64, uuid
from rekognition_helper import detect_labels, detect_text
from dynamodb_helper  import log_violation
from s3_helper         import generate_presigned_url, upload_bytes_to_s3

UPLOAD_BUCKET = os.getenv('UPLOAD_BUCKET', 'smart-traffic-uploads')

def identify_violations(labels, texts):
    """Very simple rule‑based demo — customise for your needs."""
    violations = []
    label_set  = {l.lower() for l in labels}
    text_set   = {t.lower() for t in texts}

    if 'traffic light' in label_set and any(w in text_set for w in ('red','stop')):
        violations.append('Red Light Jump')
    if 'speed limit sign' in label_set:
        violations.append('Overspeed (visual sign)')
    if 'vehicle' in label_set and 'arrow' in label_set:
        violations.append('Wrong Lane')
    return violations

def lambda_handler(event, context):
    try:
        body     = json.loads(event.get('body', '{}'))
        data_url = body['data']
        filename = body.get('filename', f"{uuid.uuid4()}.jpg")

        # strip data:image/...;base64, header
        encoded = data_url.split(',',1)[1] if ',' in data_url else data_url
        image_bytes = base64.b64decode(encoded)
        key = f"uploads/{filename}"

        # 1) save to S3
        upload_bytes_to_s3(UPLOAD_BUCKET, key, image_bytes)

        # 2) Rekognition
        labels = detect_labels(UPLOAD_BUCKET, key)
        texts  = detect_text (UPLOAD_BUCKET, key)
        violations = identify_violations(labels, texts)

        # 3) presigned URL + DDB log
        img_url = generate_presigned_url(UPLOAD_BUCKET, key)
        log_violation(img_url, labels, texts)

        return {
            "statusCode": 200,
            "headers"   : {"Content-Type":"application/json",
                           "Access-Control-Allow-Origin": "*"},
            "body"      : json.dumps({
                "imgUrl"    : img_url,
                "labels"    : labels,
                "texts"     : texts,
                "violations": violations
            })
        }

    except Exception as e:
        return {"statusCode": 500,
                "body": json.dumps({"message": str(e)})}
