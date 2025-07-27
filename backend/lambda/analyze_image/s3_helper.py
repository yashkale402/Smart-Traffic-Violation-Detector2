import boto3
s3 = boto3.client('s3')

def upload_bytes_to_s3(bucket, key, data, content_type='image/jpeg'):
    s3.put_object(Bucket=bucket, Key=key, Body=data, ContentType=content_type)

def generate_presigned_url(bucket, key, expires=3600):
    return s3.generate_presigned_url('get_object',
                                     Params={'Bucket': bucket, 'Key': key},
                                     ExpiresIn=expires)
