// MinIO bucket creation script
import { S3Client, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'alquemist',
    secretAccessKey: process.env.S3_SECRET_KEY || 'alquemist_minio_2025'
  },
  region: process.env.S3_REGION || 'us-east-1',
  forcePathStyle: true
})

async function createBuckets() {
  const buckets = [
    'alquemist-dev',
    'alquemist-photos',
    'alquemist-documents',
    'alquemist-reports',
    'alquemist-ai-models'
  ]

  for (const bucket of buckets) {
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucket }))
      console.log(`✅ Created bucket: ${bucket}`)
    } catch (error) {
      if (error.Code !== 'BucketAlreadyOwnedByYou') {
        console.error(`❌ Error creating bucket ${bucket}:`, error.message)
      }
    }
  }

  // Set bucket policy for development
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: 'arn:aws:s3:::alquemist-dev/*'
      }
    ]
  }

  try {
    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: 'alquemist-dev',
      Policy: JSON.stringify(policy)
    }))
    console.log('✅ Set public read policy for alquemist-dev bucket')
  } catch (error) {
    console.error('❌ Error setting bucket policy:', error.message)
  }
}

createBuckets().catch(console.error)
