This Heroku CLI plugin cleans up your old apps.

In the context of this plugin, a 'temp app' is one named like foo-bar-1234,
that *you own*, with no other collaborators.

```
$ heroku apps:destroy-temp
finding temp apps... done

1. immense-atoll-41822
2. hidden-savannah-60715
3. guarded-journey-99652
4. floating-atoll-86710
5. obscure-anchorage-63377

Destroy these 5 apps? (y/n): y
destroying apps... done
```

## Installation

```
$ heroku plugins:install heroku-destroy-temp
```
