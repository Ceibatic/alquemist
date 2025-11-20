# Activity Scheduling Logic

## Overview

This document details the algorithm and business logic for automatically scheduling production activities when a production order is created or approved.

## Purpose

The auto-scheduling system transforms template-level activity timing rules into concrete scheduled dates and times when a production order is initiated. This enables:
- Predictable workflow planning
- Resource allocation
- Worker task assignment
- Progress tracking
- Timeline visualization

---

## Scheduling Types

### 1. One-Time Activities

**Description**: Activities that occur once on a specific day of the phase.

**Template Configuration**:
```json
{
  "scheduling": {
    "type": "one_time",
    "phaseDay": 14  // Day 14 of the phase
  }
}
```

**Calculation Logic**:
```
scheduledDate = phaseStartDate + (phaseDay - 1) days
scheduledTime = defaultActivityTime (e.g., 09:00 AM)
```

**Example**:
- Phase starts: March 1, 2025
- Phase day: 14
- Scheduled date: March 14, 2025 at 09:00 AM

---

### 2. Recurring Activities

**Description**: Activities that repeat multiple times during a phase based on various patterns.

#### 2A. Daily Range Pattern

**Template Configuration**:
```json
{
  "scheduling": {
    "type": "recurring",
    "frequencyType": "daily_range",
    "startDay": 5,
    "endDay": 21
  }
}
```

**Calculation Logic**:
```
for day from startDay to endDay:
  scheduledDate = phaseStartDate + (day - 1) days
  create activity instance

totalInstances = (endDay - startDay) + 1
```

**Example**:
- Phase starts: March 1, 2025
- Start day: 5, End day: 21
- Creates instances: March 5, 6, 7, ..., 21 (17 instances)

#### 2B. Specific Days of Week Pattern

**Template Configuration**:
```json
{
  "scheduling": {
    "type": "recurring",
    "frequencyType": "specific_days",
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "startDay": 1,
    "endDay": 21  // or null for end of phase
  }
}
```

**Calculation Logic**:
```
currentDate = phaseStartDate + (startDay - 1)
endDate = phaseStartDate + (endDay - 1) // or phase end date

while currentDate <= endDate:
  if currentDate.dayOfWeek in daysOfWeek:
    create activity instance at currentDate
  currentDate += 1 day
```

**Example**:
- Phase starts: March 1, 2025 (Saturday)
- Days of week: Monday, Wednesday, Friday
- Range: Day 1 to 21
- Creates instances on:
  - March 3 (Mon), 5 (Wed), 7 (Fri)
  - March 10 (Mon), 12 (Wed), 14 (Fri)
  - March 17 (Mon), 19 (Wed), 21 (Fri)
  - Total: 9 instances

#### 2C. Every N Days Pattern

**Template Configuration**:
```json
{
  "scheduling": {
    "type": "recurring",
    "frequencyType": "every_n_days",
    "intervalDays": 3,
    "startDay": 1,
    "endDay": 21
  }
}
```

**Calculation Logic**:
```
currentDay = startDay
while currentDay <= endDay:
  scheduledDate = phaseStartDate + (currentDay - 1)
  create activity instance
  currentDay += intervalDays

totalInstances = floor((endDay - startDay) / intervalDays) + 1
```

**Example**:
- Phase starts: March 1, 2025
- Interval: Every 3 days
- Start day: 1, End day: 21
- Creates instances on days: 1, 4, 7, 10, 13, 16, 19 (7 instances)
- Actual dates: March 1, 4, 7, 10, 13, 16, 19

---

### 3. Dependent Activities

**Description**: Activities that are scheduled relative to another activity's completion or scheduled date.

**Template Configuration**:
```json
{
  "scheduling": {
    "type": "dependent",
    "dependsOnActivityId": "activity_template_id",
    "daysAfter": 2  // 0 = same day
  }
}
```

**Calculation Logic**:
```
// Find dependency activity's scheduled date
dependencyDate = getDependencyActivityScheduledDate(dependsOnActivityId)

if daysAfter == 0:
  scheduledDate = dependencyDate
  scheduledTime = dependencyActivityEndTime + 1 hour
else:
  scheduledDate = dependencyDate + daysAfter days
  scheduledTime = defaultActivityTime
```

**Example 1 - Same Day**:
- Dependency scheduled: March 10, 2025 at 10:00 AM (duration: 2 hours)
- Days after: 0
- Scheduled date: March 10, 2025 at 1:00 PM (after dependency + buffer)

**Example 2 - Days After**:
- Dependency scheduled: March 10, 2025 at 10:00 AM
- Days after: 2
- Scheduled date: March 12, 2025 at 09:00 AM

**Circular Dependency Detection**:
```
function hasCircularDependency(activityId, visited = []):
  if activityId in visited:
    return true  // Circular dependency found

  visited.add(activityId)

  dependencies = getDependencies(activityId)
  for dep in dependencies:
    if hasCircularDependency(dep, visited):
      return true

  return false
```

---

## Phase Dependency Logic

### Phase Start Conditions

**Immediate Start**:
```json
{
  "dependencyType": "immediate",
  "previousPhaseId": null,
  "waitDays": 0
}
```

**Calculation**:
```
phaseStartDate = productionOrderStartDate
```

**After Previous Phase**:
```json
{
  "dependencyType": "after_phase",
  "previousPhaseId": "phase_template_id",
  "waitDays": 1
}
```

**Calculation**:
```
previousPhaseEndDate = getPreviousPhaseScheduledEndDate(previousPhaseId)
phaseStartDate = previousPhaseEndDate + waitDays days
```

**Example**:
- Production order starts: March 1, 2025
- Phase 1: March 1 - March 21 (21 days)
- Phase 2 config: After Phase 1, wait 1 day
- Phase 2 start: March 22, 2025

---

## Full Scheduling Algorithm

### When Production Order is Created/Approved

```
function autoScheduleProductionOrder(orderId, startDate):
  order = getProductionOrder(orderId)
  template = order.template

  currentPhaseStartDate = startDate

  for each phase in template.phases (in order):
    // Calculate phase start date
    if phase.dependencyType == "immediate":
      phaseStartDate = currentPhaseStartDate
    else if phase.dependencyType == "after_phase":
      previousPhase = getPreviousPhase(phase.previousPhaseId)
      phaseStartDate = previousPhase.endDate + phase.waitDays days

    // Calculate phase end date
    phaseEndDate = phaseStartDate + (phase.durationDays - 1) days

    // Create phase instance
    phaseInstance = createPhaseInstance(order, phase, phaseStartDate, phaseEndDate)

    // Schedule all activities in this phase
    scheduleActivitiesForPhase(phaseInstance, phase.activities)

    // Update for next iteration
    currentPhaseStartDate = phaseEndDate + 1 day

  return order


function scheduleActivitiesForPhase(phaseInstance, activityTemplates):
  scheduledActivities = []

  // First pass: Schedule non-dependent activities
  for each activity in activityTemplates:
    if activity.scheduling.type != "dependent":
      instances = createActivityInstances(activity, phaseInstance)
      scheduledActivities.add(instances)

  // Second pass: Schedule dependent activities
  // Sort by dependency depth (dependencies of dependencies)
  sortedDependentActivities = topologicalSort(getDependentActivities(activityTemplates))

  for each activity in sortedDependentActivities:
    instances = createDependentActivityInstances(activity, phaseInstance, scheduledActivities)
    scheduledActivities.add(instances)

  return scheduledActivities


function createActivityInstances(activityTemplate, phaseInstance):
  instances = []

  switch activityTemplate.scheduling.type:
    case "one_time":
      date = calculateOneTimeDate(activityTemplate, phaseInstance)
      instance = createActivityInstance(activityTemplate, phaseInstance, date)
      instances.add(instance)

    case "recurring":
      switch activityTemplate.scheduling.frequencyType:
        case "daily_range":
          instances = createDailyRangeInstances(activityTemplate, phaseInstance)
        case "specific_days":
          instances = createSpecificDaysInstances(activityTemplate, phaseInstance)
        case "every_n_days":
          instances = createEveryNDaysInstances(activityTemplate, phaseInstance)

  return instances


function createDependentActivityInstances(activityTemplate, phaseInstance, scheduledActivities):
  instances = []

  dependencyActivityTemplate = activityTemplate.scheduling.dependsOnActivityId
  dependencyInstances = findScheduledInstances(dependencyActivityTemplate, scheduledActivities)

  // Create dependent instance for each dependency instance
  for each depInstance in dependencyInstances:
    date = depInstance.scheduledDate + activityTemplate.scheduling.daysAfter days

    if activityTemplate.scheduling.daysAfter == 0:
      // Same day, schedule after dependency completion
      time = depInstance.scheduledTime + depInstance.estimatedDuration + 1 hour
    else:
      time = defaultActivityTime

    instance = createActivityInstance(activityTemplate, phaseInstance, date, time)
    instances.add(instance)

  return instances
```

---

## Example: Complete Production Order Scheduling

### Template Configuration

**Template**: Cannabis Propagation (3 phases, 8 activities)

**Phase 1 - Propagation (21 days)**:
- Activity 1: Seeding (Day 1, one-time)
- Activity 2: Daily watering (Days 1-21, daily)
- Activity 3: Quality check (Day 14, one-time)

**Phase 2 - Vegetative (30 days, starts 1 day after Phase 1)**:
- Activity 4: Transplant (Day 1, one-time)
- Activity 5: Watering (Mon/Wed/Fri, recurring)
- Activity 6: Pest inspection (Every 7 days starting day 7)

**Phase 3 - Flowering (60 days, starts immediately after Phase 2)**:
- Activity 7: Environment adjust (Day 1, one-time)
- Activity 8: Nutrient application (Day 2, depends on Activity 7, 1 day after)

### Production Order Creation

**Order Start Date**: March 1, 2025 (Saturday)

### Scheduled Results

**Phase 1: March 1 - March 21, 2025**
- Activity 1 (Seeding): March 1 at 09:00
- Activity 2 (Daily watering): 21 instances
  - March 1, 2, 3, ..., 21 at 09:00
- Activity 3 (Quality check): March 14 at 09:00

**Phase 2: March 23 - April 21, 2025** (starts 1 day after Phase 1)
- Activity 4 (Transplant): March 23 at 09:00
- Activity 5 (Watering Mon/Wed/Fri): 13 instances
  - March 24 (Mon), 26 (Wed), 28 (Fri)
  - March 31 (Mon), April 2 (Wed), 4 (Fri)
  - April 7 (Mon), 9 (Wed), 11 (Fri)
  - April 14 (Mon), 16 (Wed), 18 (Fri)
  - April 21 (Mon)
- Activity 6 (Pest inspection every 7 days): 5 instances
  - March 29 (day 7), April 5 (day 14), April 12 (day 21), April 19 (day 28)

**Phase 3: April 22 - June 20, 2025** (starts immediately after Phase 2)
- Activity 7 (Environment adjust): April 22 at 09:00
- Activity 8 (Nutrient application): April 23 at 09:00 (1 day after Activity 7)

**Total Scheduled Activity Instances**: 44
- Phase 1: 23 instances
- Phase 2: 18 instances
- Phase 3: 2 instances
- Original template activities: 8

---

## Rescheduling Logic

### Manual Rescheduling

When a user manually reschedules an activity:

```
function rescheduleActivity(activityInstanceId, newDate, reason):
  instance = getActivityInstance(activityInstanceId)

  // Check for conflicts
  conflicts = checkResourceConflicts(instance, newDate)
  if conflicts.length > 0:
    return error("Resource conflicts found")

  // Update activity
  instance.scheduledDate = newDate
  instance.rescheduledBy = currentUser
  instance.rescheduleReason = reason
  instance.rescheduledAt = now()

  // Cascade to dependent activities
  dependentActivities = findDependentActivities(activityInstanceId)
  for each dependent in dependentActivities:
    if dependent.scheduling.type == "dependent":
      newDependentDate = newDate + dependent.scheduling.daysAfter days
      cascadeReschedule(dependent, newDependentDate, "Dependency rescheduled")

  return success
```

### Phase Delay Impact

When a phase is delayed (e.g., first activity delayed):

```
function handlePhaseDelay(phaseInstanceId, delayDays):
  phase = getPhaseInstance(phaseInstanceId)

  // Shift all activities in phase
  for each activity in phase.activities:
    activity.scheduledDate += delayDays days

  // Shift dependent phases
  dependentPhases = findDependentPhases(phaseInstanceId)
  for each depPhase in dependentPhases:
    depPhase.startDate += delayDays days
    depPhase.endDate += delayDays days

    // Recursively shift their activities
    handlePhaseDelay(depPhase.id, delayDays)

  // Update production order estimated end date
  updateOrderEstimatedEnd(phase.productionOrderId)
```

---

## Edge Cases and Validation

### 1. Weekend/Holiday Handling

**Option 1**: Skip weekends
```
if scheduledDate.isWeekend():
  scheduledDate = getNextWeekday(scheduledDate)
```

**Option 2**: Include weekends (default for agriculture)
- No adjustment needed

### 2. Area Availability Conflicts

When scheduling, verify area is available:
```
function checkAreaAvailability(areaId, date):
  // Check if area is already assigned to another active phase on this date
  conflicts = findPhases(areaId, date, status="active")
  return conflicts.isEmpty()
```

### 3. Resource Conflicts (Workers)

Prevent over-assignment:
```
function checkWorkerAvailability(workerId, date, time):
  // Check if worker has another activity at same time
  activities = findActivities(workerId, date)
  for each activity in activities:
    if timeRangesOverlap(activity, time):
      return false
  return true
```

### 4. Template Changes After Order Creation

**Rule**: Template changes do NOT affect existing production orders.
- Each production order is a snapshot of the template at creation time
- To apply new template: create new production order

### 5. Activity Completion Before Scheduled Date

**Allowed**: Users can complete activities early
- Dependent activities remain on original schedule
- Option to trigger early: reschedule dependent activities

### 6. Circular Dependencies

**Prevention**:
```
function validateTemplate(template):
  for each phase in template.phases:
    for each activity in phase.activities:
      if activity.scheduling.type == "dependent":
        if hasCircularDependency(activity.id):
          return error("Circular dependency detected")
  return success
```

---

## Performance Considerations

### Batch Creation

For large templates (100+ activities):
- Use batch insert operations
- Process in chunks of 50 activities
- Run as background job for orders with 200+ total instances

### Caching

Cache frequently accessed data:
- Phase start/end dates
- Template structure
- User assignments

### Database Indexing

Ensure indexes on:
- `activityInstances.scheduledDate`
- `activityInstances.productionOrderId`
- `activityInstances.assignedUserId`
- `activityInstances.phaseId`

---

## Future Enhancements

### 1. Smart Scheduling

Use ML to optimize activity times based on:
- Historical completion times
- Resource availability
- Weather patterns (for outdoor cultivation)
- Worker productivity patterns

### 2. Auto-Adjust for Delays

When an activity is completed late, automatically propose schedule adjustments for dependent activities.

### 3. Calendar Integration

Sync to Google Calendar, Outlook, etc. for worker visibility.

### 4. Multi-Order Resource Optimization

Optimize scheduling across multiple concurrent production orders to maximize resource utilization.

---

## API Endpoints

### Create Production Order (with auto-scheduling)

**Endpoint**: `POST /api/productionOrders/create`

**Request**:
```json
{
  "facilityId": "facility_id",
  "templateId": "template_id",
  "startDate": "2025-03-01",
  "cultivarId": "cultivar_id",
  "quantity": 100,
  "responsibleUserId": "user_id"
}
```

**Response**:
```json
{
  "orderId": "order_id",
  "scheduledActivities": 44,
  "estimatedEndDate": "2025-06-20",
  "phases": [
    {
      "phaseId": "phase_1_id",
      "startDate": "2025-03-01",
      "endDate": "2025-03-21",
      "activities": 23
    },
    // ...
  ]
}
```

### Get Scheduled Activities

**Endpoint**: `GET /api/activities/scheduled`

**Query Parameters**:
- `productionOrderId` (optional)
- `phaseId` (optional)
- `userId` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `status` (optional): scheduled, in_progress, completed, overdue

**Response**:
```json
{
  "activities": [
    {
      "activityId": "activity_1",
      "name": "Seeding",
      "scheduledDate": "2025-03-01T09:00:00Z",
      "estimatedDuration": 2.0,
      "assignedUser": {
        "userId": "user_id",
        "name": "Juan Manager"
      },
      "phase": {
        "phaseId": "phase_1_id",
        "name": "Propagation"
      },
      "productionOrder": {
        "orderId": "order_id",
        "name": "Cherry AK Batch 15"
      },
      "status": "scheduled"
    }
    // ...
  ],
  "total": 44
}
```

---

## Testing Scenarios

### Test Case 1: Simple One-Time Activities
- Create template with 3 one-time activities (days 1, 7, 14)
- Create order starting March 1
- Verify: Activities scheduled on March 1, 7, 14

### Test Case 2: Daily Range Recurring
- Create template with daily activity (days 1-10)
- Create order starting March 1
- Verify: 10 activity instances created (March 1-10)

### Test Case 3: Specific Days of Week
- Create template with Mon/Wed/Fri activity
- Create order starting March 1, 2025 (Saturday)
- Phase duration: 21 days
- Verify: Activities on Mon 3, Wed 5, Fri 7, Mon 10, Wed 12, Fri 14, Mon 17, Wed 19, Fri 21

### Test Case 4: Dependent Activities
- Activity A: Day 5
- Activity B: 2 days after Activity A
- Create order starting March 1
- Verify: A scheduled March 5, B scheduled March 7

### Test Case 5: Circular Dependency Detection
- Activity A depends on Activity B
- Activity B depends on Activity A
- Attempt to create template
- Verify: Error returned, template not saved

### Test Case 6: Phase Dependencies
- Phase 1: 10 days
- Phase 2: After Phase 1, wait 2 days, 15 days duration
- Create order starting March 1
- Verify: Phase 1 (Mar 1-10), Phase 2 (Mar 13-27)

### Test Case 7: Manual Reschedule with Cascade
- Activity A: March 5
- Activity B: Depends on A, 1 day after
- Reschedule A to March 7
- Verify: B automatically rescheduled to March 8

---

This document serves as the specification for implementing the activity auto-scheduling system in both the frontend (Bubble.io) and backend (Convex).
