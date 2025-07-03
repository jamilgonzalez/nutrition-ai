import { UserProfile } from '../types'

interface ProfileSummaryProps {
  profile: UserProfile
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Your Profile Summary:</h3>
      <p>
        <strong>Age:</strong> {profile.age} years
      </p>
      <p>
        <strong>Sex:</strong> {profile.sex}
      </p>
      <p>
        <strong>Height:</strong> {profile.height} inches
      </p>
      <p>
        <strong>Weight:</strong> {profile.weight} lbs
      </p>
      <p>
        <strong>Activity Level:</strong> {profile.activityLevel}
      </p>
      <p>
        <strong>Goals:</strong> {profile.goals.join(', ')}
      </p>
      {profile.healthConditions.length > 0 && (
        <p>
          <strong>Health Conditions:</strong>{' '}
          {profile.healthConditions.join(', ')}
        </p>
      )}
      {profile.dietaryRestrictions.length > 0 && (
        <p>
          <strong>Dietary Restrictions:</strong>{' '}
          {profile.dietaryRestrictions.join(', ')}
        </p>
      )}
    </div>
  )
}