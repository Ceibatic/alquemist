#!/bin/bash
# Quick check to see how many municipalities we have so far
echo "Counting municipalities in data file..."
grep "code:" /home/kris/ceibatic/products/alquemist/convex/colombiaMunicipalitiesData.ts | wc -l
