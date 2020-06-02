import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Keyboard, TextPropTypes } from 'react-native';

class Chromosome {
  genes = [];
  constructor(length, max) {
      for (let i = 0; i < length; i++) {
          this.genes[i] = Math.floor(Math.random() * Math.floor(max))
      }
  }
  getGene(position) {
      return this.genes[position];
  }
  setGene(position, gene) {
      this.genes[position] = gene;
  }
  setGenes(genes) {
      this.genes = genes;
      return this;
  }
}

class GeneticAlg {
  populationSize = 4;
  mutationCount = 1;
  numberOfGenerations = 0;

  fitness = [];
  population = [];

  constructor(coefficients, max) {
      this.coefficients = coefficients;
      this.max = max;
      this.genesCount = coefficients.length;
      for (let i = 0; i < this.populationSize; i++)
          this.population[i] = new Chromosome(this.genesCount, this.max);
  }

  calc() {
      while (1) {
          this.calculateFitnessOfPopulation(this.population);
          let winnerIndex = this.checkFitness();
          if (winnerIndex !== -1)
              return {
                  gen: this.population[winnerIndex],
                  count: this.numberOfGenerations
              };
          this.calculateSurvival();
          this.generateNextPopulation();
          this.mutate();
      }
  }

  mutate() {
      let index;
      for (let i = 0; i < this.mutationCount; i++) {
          index = Math.floor(Math.random() * Math.floor(this.genesCount));
          this.population[Math.floor(Math.random() * Math.floor(this.populationSize))].setGene(index, Math.floor(Math.random() * Math.floor(this.max)));
      }
      this.numberOfGenerations++;
  }

  calculateFitnessOfPopulation(population) {
      for (let i = 0; i < this.populationSize; i++)
          this.fitness[i] = this.calculateFitnessOfChromosome(population[i]);
  }

  calculateFitnessOfChromosome(chr) {
      let value = 0;
      for (let i = 0; i < this.populationSize; i++)
          value += this.coefficients[i] * chr.getGene(i);
      return Math.abs(value - this.max);
  }

  checkFitness() {
      for (let i = 0; i < this.populationSize; i++)
          if (this.fitness[i] <= 1) return i;
      return -1;
  }

  generateNextPopulation() {
      let newPopulation = [];
      for (let i = 0; i < this.populationSize; i++) {
          let tmp1 = this.rouletteRoot(this.population);
          let tmp2 = this.rouletteRoot(this.population);
          newPopulation[i] = this.crossover(tmp1, tmp2);
      }
      this.population = newPopulation;
  }

  crossover(chr1, chr2) {
      let separator = Math.floor(Math.random() * Math.floor(3)) + 1;
      let genes = [];
      for (let index = 0; index < this.genesCount; index++) {
          if (index < separator) genes[index] = chr1.getGene(index);
          else genes[index] = chr2.getGene(index);
      }
      let tmp = new Chromosome()
      return tmp.setGenes(genes);
  }

  rouletteRoot(population) {
      let random = Math.random();
      let surv = this.calcSurvivavlForSelection(this.survival);
      for (let i = 0; i < surv.length; i++)
          if (random < surv[i]) return population[i];
      return population[this.getBest()];
  }

  getBest() {
      let currrentMin = this.fitness[0];
      let index = 0;
      for (let i = 1; i < this.fitness.length; i++) {
          if (this.fitness[i] < currrentMin) {
              currrentMin = this.fitness[i];
              index = i;
          }
      }
      return index;
  }

  calcSurvivavlForSelection(survivals) {
      let selectSurvival = [];
      let sum = 0;
      for (let i = 0; i < survivals.length; i++) {
          selectSurvival[i] = survivals[i] + sum;
          sum = selectSurvival[i];
      }
      return selectSurvival;
  }

  calculateSurvival() {
      let survival = [];
      let sum = 0;
      for (let i = 0; i < this.populationSize; i++) {
          survival[i] = 1. / this.fitness[i];
          sum += survival[i];
      }
      for (let i = 0; i < this.populationSize; i++)
          survival[i] /= sum;
      this.survival = survival;
  }

}

export default class App extends Component {
  state = {
    warn: '',
    genes: '',
    count: 0
  }
  calc = () => {
    if (!this.state.x1 || !this.state.x2 || !this.state.x3 || !this.state.x4 || !this.state.y) {
      this.setState({ warn: 'Wrong input', genes: '', count: null });
      return
    }
    let generic = new GeneticAlg([this.state.x1, this.state.x2, this.state.x3, this.state.x4], this.state.y)
    const res = generic.calc()
    if (!res.warn) {
      console.log(res.gen.genes);
      this.setState({ genes: `(${res.gen.genes.join(', ')})`, count: res.count, warn: '' });
    } else {
      this.setState({ warn: res.warn, genes: '', count: null });
    }
  }

  randomNumber(min, max) {
    return min + Math.floor(Math.random()*(max + 1 - min));
  }

  calcRandom = () => {
    let generic = new GeneticAlg([
      this.randomNumber(1, 10), 
      this.randomNumber(1, 10), 
      this.randomNumber(1, 10), 
      this.randomNumber(1, 10)], 
      this.randomNumber(1, 4)
    );
    const res = generic.calc();
    if (!res.warn) {
      console.log(this.randomNumber(1, 10));
      this.setState({ genes: `(${res.gen.genes.join(', ')})`, count: res.count, warn: '' });
    } else {
      this.setState({ warn: res.warn, genes: '', count: null });
    }
  }
  render() {
    return (
      <View style={styles.container} >
        <Text style={{ fontWeight: 'bold', fontSize: 30 }}>Genetic algorithm</Text>
        <Text style={{ margin: 50, fontSize: 30 }}>Coefficients</Text>
        <View style={{ margin: 10, display: 'flex', flexDirection: 'row' }}>
          <TextInput style={styles.input} onChangeText={(text) => this.setState({ x1: parseInt(text) })}></TextInput>
          <Text> X1 + </Text>
          <TextInput style={styles.input} onChangeText={(text) => this.setState({ x2: parseInt(text) })}></TextInput>
          <Text> X2 + </Text>
          <TextInput style={styles.input} onChangeText={(text) => this.setState({ x3: parseInt(text) })}></TextInput>
          <Text> X3 + </Text>
          <TextInput style={styles.input} onChangeText={(text) => this.setState({ x4: parseInt(text) })}></TextInput>
          <Text> X4 = </Text>
          <TextInput style={styles.input} onChangeText={(text) => this.setState({ y: parseInt(text) })}></TextInput>
        </View>
        <Text style={{ margin: 10, color: 'red'}}>{this.state.warn}</Text>
        <Button style={{ margin: 20, color: 'red' }} title='Calculate' onPress={this.calc} />
        <Button style={{ margin: 20, color: 'red' }} title='Random coeffs' onPress={this.calcRandom} />
        <Text style={{margin: 20}}>{this.state.genes ? `Output: ${this.state.genes}` : ''}</Text>
        <Text>{this.state.count ? `Amount of iterations: ${this.state.count}` : ''}</Text>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b9ffff',
    paddingTop: 50,
    paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    height: 20,
    width: 30,
    borderWidth: 1
  } 
});