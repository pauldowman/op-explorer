#!/bin/bash

# Exit on error
set -e

S3_BUCKET="op-explorer.pauldowman.com"
CLOUDFRONT_DISTRIBUTION_ID="E2N5ID6YW3B3WE"
BUILD_DIR="dist"

echo "🚀 Deploying..."

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "📤 Uploading to S3..."
aws s3 sync $BUILD_DIR s3://$S3_BUCKET --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "✅ Deployment complete!" 