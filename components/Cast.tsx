import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useNeynarContext } from "@neynar/react";
import { fetchCastByHash} from "@/lib/neynar";

const STORAGE_KEY = 'sos-cast-storage';

export default function Cast() {
  const [cast, setCast] = useState<any>(null);
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  const params = useParams();
  const hash = params.hash as `0x${string}`;

  const { user } = useNeynarContext();

  useEffect(() => {
    try {
      const storageItem = localStorage.getItem(STORAGE_KEY);
      if (storageItem) {
        const storedData = JSON.parse(storageItem);
        if (storedData?.apikey) setUserApiKey(storedData.apikey);
      }
    } catch (error) {
      console.error("Failed to read data from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    async function fetchCast() {
      setLoading(true);
      try {
        const castData = await fetchCastByHash(hash, userApiKey || "", user?.fid);
        setCast(castData);
      } catch (error) {
        console.error("Failed to fetch cast:", error);
        setError("Failed to load cast");
      } finally {
        setLoading(false);
      }
    }
    if (hash && !cast) fetchCast();
  }, [hash]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }
  
  if (!cast) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-muted-foreground">Cast not found</div>
      </div>
    );
  }
  
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="w-full max-w-[600px] mx-auto p-4">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        {/* Author section */}
        <div className="flex items-start space-x-3 mb-4">
          <img
            src={cast.author.pfp_url}
            alt={cast.author.display_name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground">
                {cast.author.display_name}
              </h3>
              <span className="text-muted-foreground">
                @{cast.author.username}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatTimestamp(cast.timestamp)}
            </p>
          </div>
        </div>

        {/* Channel if present */}
        {cast.channel && (
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
              <img
                src={cast.channel.image_url}
                alt={cast.channel.name}
                className="w-4 h-4 rounded-full"
              />
              <span className="text-sm font-medium">
                {cast.channel.name}
              </span>
            </div>
          </div>
        )}

        {/* Cast message */}
        <div className="mb-4 text-foreground whitespace-pre-wrap">
          {cast.text}
        </div>

        {/* Embeds if present */}
        {cast.embeds && cast.embeds.length > 0 && (
          <div className="mb-4 space-y-2">
            {cast.embeds.map((embed: any, index: number) => (
              <div key={index} className="bg-muted rounded-lg p-3">
                {embed.cast && (
                  <div className="text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={embed.cast.author.pfp_url}
                        alt={embed.cast.author.display_name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">
                        {embed.cast.author.display_name}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {embed.cast.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions section */}
        <div className="flex items-center space-x-6 pt-4 border-t border-border">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <span className="text-sm">
              {cast.replies?.count || 0} replies
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground">
            <span className="text-sm">
              {cast.reactions?.likes_count || 0} likes
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground">
            <span className="text-sm">
              {cast.reactions?.recasts_count || 0} recasts
            </span>
          </div>
        </div>

        {/* Parent cast if this is a reply */}
        {cast.parent_hash && cast.parent_author && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground mb-2">
              Replying to @{cast.parent_author.username}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/*
{
  "cast": {
    "object": "cast",
    "hash": "<string>",
    "parent_hash": "<string>",
    "parent_url": "<string>",
    "root_parent_url": "<string>",
    "parent_author": {
      "fid": 3
    },
    "author": {
      "object": "user",
      "fid": 3,
      "username": "<string>",
      "display_name": "<string>",
      "custody_address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
      "pro": {
        "status": "subscribed",
        "subscribed_at": "2023-11-07T05:31:56Z",
        "expires_at": "2023-11-07T05:31:56Z"
      },
      "pfp_url": "<string>",
      "profile": {
        "bio": {
          "text": "<any>",
          "mentioned_profiles": "<any>",
          "mentioned_profiles_ranges": "<any>",
          "mentioned_channels": "<any>",
          "mentioned_channels_ranges": "<any>"
        },
        "location": {
          "latitude": "<any>",
          "longitude": "<any>",
          "address": "<any>",
          "radius": "<any>"
        },
        "banner": {
          "url": "<any>"
        }
      },
      "follower_count": 123,
      "following_count": 123,
      "verifications": [
        "0x5a927ac639636e534b678e81768ca19e2c6280b7"
      ],
      "auth_addresses": [
        {
          "address": "<any>",
          "app": "<any>"
        }
      ],
      "verified_addresses": {
        "eth_addresses": [
          "<any>"
        ],
        "sol_addresses": [
          "<any>"
        ],
        "primary": {
          "eth_address": "<any>",
          "sol_address": "<any>"
        }
      },
      "verified_accounts": [
        {
          "platform": "<any>",
          "username": "<any>"
        }
      ],
      "experimental": {
        "deprecation_notice": "<string>",
        "neynar_user_score": 123
      },
      "viewer_context": {
        "following": true,
        "followed_by": true,
        "blocking": true,
        "blocked_by": true
      },
      "score": 123
    },
    "app": {
      "object": "user_dehydrated",
      "fid": 3,
      "username": "<string>",
      "display_name": "<string>",
      "pfp_url": "<string>",
      "custody_address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
      "score": 123
    },
    "text": "<string>",
    "timestamp": "2023-11-07T05:31:56Z",
    "embeds": [
      {
        "cast_id": {
          "fid": 3,
          "hash": "<string>"
        },
        "cast": {
          "hash": "<string>",
          "parent_hash": "<string>",
          "parent_url": "<string>",
          "root_parent_url": "<string>",
          "parent_author": {
            "fid": 3
          },
          "author": {
            "object": "<any>",
            "fid": "<any>",
            "username": "<any>",
            "display_name": "<any>",
            "pfp_url": "<any>",
            "custody_address": "<any>",
            "score": "<any>"
          },
          "app": {
            "object": "user_dehydrated",
            "fid": 3,
            "username": "<string>",
            "display_name": "<string>",
            "pfp_url": "<string>",
            "custody_address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
            "score": 123
          },
          "text": "<string>",
          "timestamp": "2023-11-07T05:31:56Z",
          "embeds": [
            {
              "cast_id": {
                "fid": 3,
                "hash": "<string>"
              },
              "cast": {
                "object": "cast_dehydrated",
                "hash": "<string>",
                "author": {
                  "object": "<any>",
                  "fid": "<any>",
                  "username": "<any>",
                  "display_name": "<any>",
                  "pfp_url": "<any>",
                  "custody_address": "<any>",
                  "score": "<any>"
                },
                "app": {}
              }
            }
          ],
          "channel": {
            "id": "<string>",
            "name": "<string>",
            "object": "channel_dehydrated",
            "image_url": "<string>",
            "viewer_context": {
              "following": true,
              "role": "member"
            }
          }
        }
      }
    ],
    "type": "cast-mention",
    "reactions": {
      "likes": [
        {
          "fid": 3,
          "fname": "<string>"
        }
      ],
      "recasts": [
        {
          "fid": 3,
          "fname": "<string>"
        }
      ],
      "likes_count": 123,
      "recasts_count": 123
    },
    "replies": {
      "count": 123
    },
    "thread_hash": "<string>",
    "mentioned_profiles": [
      {
        "object": "user",
        "fid": 3,
        "username": "<string>",
        "display_name": "<string>",
        "custody_address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
        "pro": {
          "status": "subscribed",
          "subscribed_at": "2023-11-07T05:31:56Z",
          "expires_at": "2023-11-07T05:31:56Z"
        },
        "pfp_url": "<string>",
        "profile": {
          "bio": {
            "text": "<any>",
            "mentioned_profiles": "<any>",
            "mentioned_profiles_ranges": "<any>",
            "mentioned_channels": "<any>",
            "mentioned_channels_ranges": "<any>"
          },
          "location": {
            "latitude": "<any>",
            "longitude": "<any>",
            "address": "<any>",
            "radius": "<any>"
          },
          "banner": {
            "url": "<any>"
          }
        },
        "follower_count": 123,
        "following_count": 123,
        "verifications": [
          "0x5a927ac639636e534b678e81768ca19e2c6280b7"
        ],
        "auth_addresses": [
          {
            "address": "<any>",
            "app": "<any>"
          }
        ],
        "verified_addresses": {
          "eth_addresses": [
            "<any>"
          ],
          "sol_addresses": [
            "<any>"
          ],
          "primary": {
            "eth_address": "<any>",
            "sol_address": "<any>"
          }
        },
        "verified_accounts": [
          {
            "platform": "<any>",
            "username": "<any>"
          }
        ],
        "experimental": {
          "deprecation_notice": "<string>",
          "neynar_user_score": 123
        },
        "viewer_context": {
          "following": true,
          "followed_by": true,
          "blocking": true,
          "blocked_by": true
        },
        "score": 123
      }
    ],
    "mentioned_profiles_ranges": [
      {
        "start": 1,
        "end": 1
      }
    ],
    "mentioned_channels": [
      {
        "id": "<string>",
        "name": "<string>",
        "object": "channel_dehydrated",
        "image_url": "<string>",
        "viewer_context": {
          "following": true,
          "role": "member"
        }
      }
    ],
    "mentioned_channels_ranges": [
      {
        "start": 1,
        "end": 1
      }
    ],
    "channel": {
      "id": "<string>",
      "url": "<string>",
      "name": "<string>",
      "description": "<string>",
      "object": "channel",
      "created_at": "2023-11-07T05:31:56Z",
      "follower_count": 123,
      "external_link": {
        "title": "<string>",
        "url": "<string>"
      },
      "image_url": "<string>",
      "parent_url": "<string>",
      "lead": {
        "object": "user",
        "fid": 3,
        "username": "<string>",
        "display_name": "<string>",
        "custody_address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
        "pro": {
          "status": "subscribed",
          "subscribed_at": "2023-11-07T05:31:56Z",
          "expires_at": "2023-11-07T05:31:56Z"
        },
        "pfp_url": "<string>",
        "profile": {
          "bio": {
            "text": "<any>",
            "mentioned_profiles": "<any>",
            "mentioned_profiles_ranges": "<any>",
            "mentioned_channels": "<any>",
            "mentioned_channels_ranges": "<any>"
          },
          "location": {
            "latitude": "<any>",
            "longitude": "<any>",
            "address": "<any>",
            "radius": "<any>"
          },
          "banner": {
            "url": "<any>"
          }
        },
        "follower_count": 123,
        "following_count": 123,
        "verifications": [
          "0x5a927ac639636e534b678e81768ca19e2c6280b7"
        ],
        "auth_addresses": [
          {
            "address": "<any>",
            "app": "<any>"
          }
        ],
        "verified_addresses": {
          "eth_addresses": [
            "<any>"
          ],
          "sol_addresses": [
            "<any>"
          ],
          "primary": {
            "eth_address": "<any>",
            "sol_address": "<any>"
          }
        },
        "verified_accounts": [
          {
            "platform": "<any>",
            "username": "<any>"
          }
        ],
        "experimental": {
          "deprecation_notice": "<string>",
          "neynar_user_score": 123
        },
        "viewer_context": {
          "following": true,
          "followed_by": true,
          "blocking": true,
          "blocked_by": true
        },
        "score": 123
      },
      "moderator_fids": [
        3
      ],
      "member_count": 123,
      "moderator": {
        "object": "user",
        "fid": 3,
        "username": "<string>",
        "display_name": "<string>",
        "custody_address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
        "pro": {
          "status": "subscribed",
          "subscribed_at": "2023-11-07T05:31:56Z",
          "expires_at": "2023-11-07T05:31:56Z"
        },
        "pfp_url": "<string>",
        "profile": {
          "bio": {
            "text": "<any>",
            "mentioned_profiles": "<any>",
            "mentioned_profiles_ranges": "<any>",
            "mentioned_channels": "<any>",
            "mentioned_channels_ranges": "<any>"
          },
          "location": {
            "latitude": "<any>",
            "longitude": "<any>",
            "address": "<any>",
            "radius": "<any>"
          },
          "banner": {
            "url": "<any>"
          }
        },
        "follower_count": 123,
        "following_count": 123,
        "verifications": [
          "0x5a927ac639636e534b678e81768ca19e2c6280b7"
        ],
        "auth_addresses": [
          {
            "address": "<any>",
            "app": "<any>"
          }
        ],
        "verified_addresses": {
          "eth_addresses": [
            "<any>"
          ],
          "sol_addresses": [
            "<any>"
          ],
          "primary": {
            "eth_address": "<any>",
            "sol_address": "<any>"
          }
        },
        "verified_accounts": [
          {
            "platform": "<any>",
            "username": "<any>"
          }
        ],
        "experimental": {
          "deprecation_notice": "<string>",
          "neynar_user_score": 123
        },
        "viewer_context": {
          "following": true,
          "followed_by": true,
          "blocking": true,
          "blocked_by": true
        },
        "score": 123
      },
      "pinned_cast_hash": "0x71d5225f77e0164388b1d4c120825f3a2c1f131c",
      "hosts": [
        {
          "object": "user",
          "fid": 3,
          "username": "<string>",
          "display_name": "<string>",
          "custody_address": "0x5a927ac639636e534b678e81768ca19e2c6280b7",
          "pro": {
            "status": "subscribed",
            "subscribed_at": "2023-11-07T05:31:56Z",
            "expires_at": "2023-11-07T05:31:56Z"
          },
          "pfp_url": "<string>",
          "profile": {
            "bio": {
              "text": "<any>",
              "mentioned_profiles": "<any>",
              "mentioned_profiles_ranges": "<any>",
              "mentioned_channels": "<any>",
              "mentioned_channels_ranges": "<any>"
            },
            "location": {
              "latitude": "<any>",
              "longitude": "<any>",
              "address": "<any>",
              "radius": "<any>"
            },
            "banner": {
              "url": "<any>"
            }
          },
          "follower_count": 123,
          "following_count": 123,
          "verifications": [
            "0x5a927ac639636e534b678e81768ca19e2c6280b7"
          ],
          "auth_addresses": [
            {
              "address": "<any>",
              "app": "<any>"
            }
          ],
          "verified_addresses": {
            "eth_addresses": [
              "<any>"
            ],
            "sol_addresses": [
              "<any>"
            ],
            "primary": {
              "eth_address": "<any>",
              "sol_address": "<any>"
            }
          },
          "verified_accounts": [
            {
              "platform": "<any>",
              "username": "<any>"
            }
          ],
          "experimental": {
            "deprecation_notice": "<string>",
            "neynar_user_score": 123
          },
          "viewer_context": {
            "following": true,
            "followed_by": true,
            "blocking": true,
            "blocked_by": true
          },
          "score": 123
        }
      ],
      "viewer_context": {
        "following": true,
        "role": "member"
      },
      "description_mentioned_profiles": [
        {
          "object": "<any>",
          "fid": "<any>",
          "username": "<any>",
          "display_name": "<any>",
          "pfp_url": "<any>",
          "custody_address": "<any>",
          "score": "<any>"
        }
      ],
      "description_mentioned_profiles_ranges": [
        {
          "start": 1,
          "end": 1
        }
      ]
    },
    "viewer_context": {
      "liked": true,
      "recasted": true
    },
    "author_channel_context": {
      "following": true,
      "role": "member"
    }
  }
}
*/
