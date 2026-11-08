<?php

namespace App\Http\Resources\Travel;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TravelUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'status' => $this->status,
            'location' => $this->location,
            'bio' => $this->bio,
            'verified' => (bool) $this->verified,
            'subscription' => $this->subscription,
            'activity_level' => $this->activity_level,
            'provider' => $this->provider,
            'is_online' => $this->isOnline(),
            'online_status' => $this->online_status,
            'last_active_human' => $this->last_active_human,
            'last_active_at' => $this->last_active_at ? $this->last_active_at->toIso8601String() : null,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
            'business' => $this->when($this->isBusinessOwner(), function () {
                $biz = $this->businesses()->with(['category', 'province'])->first();
                if (!$biz) {
                    return null;
                }
                return [
                    'id' => $biz->id,
                    'owner_id' => $biz->owner_id,
                    'name' => $biz->name,
                    'category' => $biz->category?->name ?? (string) $biz->category_id,
                    'province' => $biz->province?->name ?? (string) $biz->province_id,
                    'address' => $biz->address,
                    'status' => $biz->status,
                    'verification_status' => $biz->verification_status,
                ];
            }),
        ];
    }
}
