function init(obj: any, amount: number) {
  return new AliasMethod(obj, amount)
}

export interface init {
  (obj: any, amount: number): any
}

export default init

class AliasMethod {
  private obj: any
  private amount: number
  private alias: number[]
  private prob: number[]
  private outcomes: any[]

  constructor(obj: any, amount: number) {
    let outcomes = []
    let probabilities = []
    for (const key in obj) {
      probabilities.push(obj[key] / amount)
      outcomes.push(key)
    }

    this.obj = obj
    this.amount = amount
    this.alias = []
    this.prob = []
    this.outcomes = outcomes

    this.precomputeAlias(probabilities)
  }

  private precomputeAlias(p: any[]) {
    var n = p.length,
      sum = 0,
      nS = 0,
      nL = 0,
      P = [],
      S = [],
      L = [],
      g,
      i,
      a

    // Normalize probabilities
    for (i = 0; i < n; ++i) {
      if (p[i] < 0) {
        throw 'Probability must be a positive: p[' + i + ']=' + p[i]
      }
      sum += p[i]
    }

    if (sum === 0) {
      throw 'Probability cannot be zero.'
    }

    for (i = 0; i < n; ++i) {
      P[i] = p[i] * n / sum
    }

    // Set separate index lists for small and large probabilities:
    for (i = n - 1; i >= 0; --i) {
      // at variance from Schwarz, we revert the index order
      if (P[i] < 1) S[nS++] = i
      else L[nL++] = i
    }

    // Work through index lists
    while (nS && nL) {
      a = S[--nS] // Schwarz's l
      g = L[--nL] // Schwarz's g

      this.prob[a] = P[a]
      this.alias[a] = g

      P[g] = P[g] + P[a] - 1
      if (P[g] < 1) S[nS++] = g
      else L[nL++] = g
    }

    while (nL) this.prob[L[--nL]] = 1

    while (nS)
      // can only happen through numeric instability
      this.prob[S[--nS]] = 1
  }

  next(numOfSamples: number) {
    var n = numOfSamples || this.amount * 10,
      out = [],
      i = 0

    let goods = this.obj

    do {
      var c = this.randomInt(0, this.prob.length)
      let res = this.outcomes[Math.random() < this.prob[c] ? c : this.alias[c]]
      if (goods[res] > 0) {
        out.push(res)
        goods[res]--
      }
    } while (++i < n)

    for (const key in goods) {
      if (goods[key] > 0) {
        let len = goods[key]
        for (let index = 0; index < len; index++) {
          out.push(key)
          goods[key]--
        }
      }
    }
    console.log(JSON.stringify(goods) + ' - ' + out.length)

    return out
  }

  private randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min
  }
}
